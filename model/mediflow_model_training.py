"""
MediFlow demand forecasting trainer.

What this script improves versus the previous version:
1) Auto-detects the attached dataset path (data.csv by default).
2) Uses strict time-based validation to prevent leakage.
3) Tunes LightGBM for better MAE and supports optional XGBoost + blending.
4) Applies recency weighting so newly seeded data influences the model more.
5) Saves model artifacts, encoders, and training history for continual retraining.
6) Automatically uses GPU when available, else safely falls back to CPU.

Typical usage:
  python mediflow_model_training.py
  python mediflow_model_training.py --use-xgboost --tune-trials 30
  python mediflow_model_training.py --new-data latest_seed_export.csv --persist-merged
"""

from __future__ import annotations

import argparse
import json
import random
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, List, Optional, Tuple

import numpy as np
import pandas as pd
from sklearn.metrics import mean_absolute_error, mean_squared_error


DEFAULT_TARGET = "units_sold_today"
SUPPORTED_TARGETS = ("units_sold_today", "future_7day_demand")

RAW_CATEGORICAL_COLUMNS = [
    "season",
    "medicine_type",
    "price_segment",
    "weather_condition",
    "category_name",
    "retailer_size",
    "retailer_location",
]

MODEL_FEATURES = [
    "month_sin",
    "month_cos",
    "dow_sin",
    "dow_cos",
    "week_of_year",
    "is_weekend",
    "season_enc",
    "medicine_type_enc",
    "is_generic",
    "requires_rx",
    "price_segment_enc",
    "category_name_enc",
    "lag_1_sales",
    "lag_7_sales",
    "rolling_avg_7",
    "rolling_avg_14",
    "demand_momentum",
    "current_stock",
    "days_of_stock_left",
    "reorder_level",
    "stockout_flag",
    "storage_limit",
    "stock_pressure",
    "cost_price",
    "selling_price",
    "margin",
    "margin_pct",
    "inventory_value",
    "available_budget",
    "budget_utilization",
    "seasonal_factor",
    "disease_risk_score",
    "temperature_c",
    "humidity_pct",
    "weather_condition_enc",
    "heat_humidity_index",
    "lead_time_days",
    "supplier_reliability",
    "avg_order_quantity",
    "order_frequency_days",
    "under_order_bias",
    "retailer_size_enc",
    "retailer_location_enc",
]

RAW_NUMERIC_COLUMNS = [
    "month",
    "day_of_week",
    "week_of_year",
    "is_weekend",
    "is_generic",
    "requires_rx",
    "lag_1_sales",
    "lag_7_sales",
    "rolling_avg_7",
    "rolling_avg_14",
    "current_stock",
    "days_of_stock_left",
    "reorder_level",
    "stockout_flag",
    "storage_limit",
    "cost_price",
    "selling_price",
    "margin",
    "margin_pct",
    "inventory_value",
    "available_budget",
    "seasonal_factor",
    "disease_risk_score",
    "temperature_c",
    "humidity_pct",
    "lead_time_days",
    "supplier_reliability",
    "avg_order_quantity",
    "order_frequency_days",
    "under_order_bias",
    "future_7day_demand",
    "units_sold_today",
]

DEDUPLICATION_KEYS = ["date", "medicine_id", "retailer_id"]


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Train MediFlow demand forecasting models")
    parser.add_argument(
        "--dataset",
        type=str,
        default=None,
        help="Dataset CSV path. If omitted, script auto-detects data.csv.",
    )
    parser.add_argument(
        "--new-data",
        type=str,
        default=None,
        help="Optional CSV containing newly seeded rows to merge before training.",
    )
    parser.add_argument(
        "--persist-merged",
        action="store_true",
        help="If set, writes merged data back to the main dataset file.",
    )
    parser.add_argument(
        "--target",
        type=str,
        default=DEFAULT_TARGET,
        choices=SUPPORTED_TARGETS,
        help="Training target column.",
    )
    parser.add_argument(
        "--validation-days",
        type=int,
        default=90,
        help="Hold out this many latest days for validation (if train-end-date not set).",
    )
    parser.add_argument(
        "--train-end-date",
        type=str,
        default=None,
        help="Optional explicit train end date, example: 2025-03-31.",
    )
    parser.add_argument(
        "--tune-trials",
        type=int,
        default=24,
        help="How many random hyperparameter trials to run.",
    )
    parser.add_argument(
        "--use-xgboost",
        action="store_true",
        help="Train XGBoost too and auto-select best blend by validation MAE.",
    )
    parser.add_argument(
        "--half-life-days",
        type=float,
        default=120.0,
        help="Recency half-life in days for sample weights.",
    )
    parser.add_argument(
        "--max-rows",
        type=int,
        default=None,
        help="Optional row cap for quicker experimentation on large datasets.",
    )
    parser.add_argument(
        "--seed",
        type=int,
        default=42,
        help="Random seed for reproducibility.",
    )
    parser.add_argument(
        "--artifacts-dir",
        type=str,
        default="artifacts",
        help="Where to save models, encoders, and training history.",
    )
    return parser.parse_args()


def resolve_csv_path(path_arg: Optional[str], script_dir: Path, fallback_names: List[str]) -> Path:
    candidates: List[Path] = []

    if path_arg:
        raw = Path(path_arg)
        if raw.is_absolute():
            candidates.append(raw)
        else:
            candidates.extend([Path.cwd() / raw, script_dir / raw])

    for filename in fallback_names:
        candidates.extend([script_dir / filename, Path.cwd() / filename])

    seen = set()
    for candidate in candidates:
        norm = str(candidate.resolve()) if candidate.exists() else str(candidate)
        if norm in seen:
            continue
        seen.add(norm)
        if candidate.exists():
            return candidate.resolve()

    looked_in = "\n".join(f" - {str(p)}" for p in candidates)
    raise FileNotFoundError(
        "Could not find dataset CSV. Checked:\n"
        f"{looked_in}\n"
        "Attach data.csv in model folder or pass --dataset <path>."
    )


def load_dataset(path: Path, max_rows: Optional[int] = None) -> pd.DataFrame:
    df = pd.read_csv(path, parse_dates=["date"])
    sort_cols = [c for c in ["medicine_id", "retailer_id", "date"] if c in df.columns]
    if sort_cols:
        df = df.sort_values(sort_cols)

    if max_rows and max_rows > 0 and len(df) > max_rows:
        df = df.tail(max_rows)

    return df.reset_index(drop=True)


def merge_new_data(base_df: pd.DataFrame, new_df: pd.DataFrame) -> pd.DataFrame:
    combined = pd.concat([base_df, new_df], ignore_index=True)
    valid_keys = [col for col in DEDUPLICATION_KEYS if col in combined.columns]

    if valid_keys:
        combined = combined.sort_values("date").drop_duplicates(subset=valid_keys, keep="last")

    sort_cols = [c for c in ["medicine_id", "retailer_id", "date"] if c in combined.columns]
    if sort_cols:
        combined = combined.sort_values(sort_cols)

    return combined.reset_index(drop=True)


def ensure_calendar_columns(df: pd.DataFrame) -> pd.DataFrame:
    if "date" not in df.columns:
        raise ValueError("Dataset must include a 'date' column.")

    df = df.copy()
    df["date"] = pd.to_datetime(df["date"], errors="coerce")
    df = df[df["date"].notna()].copy()

    month_from_date = df["date"].dt.month
    dow_from_date = df["date"].dt.dayofweek
    week_from_date = df["date"].dt.isocalendar().week.astype(int)
    weekend_from_date = (dow_from_date >= 5).astype(int)

    if "month" not in df.columns:
        df["month"] = month_from_date
    else:
        df["month"] = pd.to_numeric(df["month"], errors="coerce").fillna(month_from_date)

    if "day_of_week" not in df.columns:
        df["day_of_week"] = dow_from_date
    else:
        df["day_of_week"] = pd.to_numeric(df["day_of_week"], errors="coerce").fillna(dow_from_date)

    if "week_of_year" not in df.columns:
        df["week_of_year"] = week_from_date
    else:
        df["week_of_year"] = pd.to_numeric(df["week_of_year"], errors="coerce").fillna(week_from_date)

    if "is_weekend" not in df.columns:
        df["is_weekend"] = weekend_from_date
    else:
        df["is_weekend"] = pd.to_numeric(df["is_weekend"], errors="coerce").fillna(weekend_from_date)

    return df


def ensure_core_columns(df: pd.DataFrame, target: str) -> pd.DataFrame:
    if target not in df.columns:
        raise ValueError(f"Target column '{target}' is missing from dataset.")

    out = df.copy()

    for col in RAW_CATEGORICAL_COLUMNS:
        if col not in out.columns:
            out[col] = "unknown"
        out[col] = out[col].fillna("unknown").astype(str).str.strip().replace("", "unknown")

    for col in RAW_NUMERIC_COLUMNS:
        if col not in out.columns:
            out[col] = np.nan
        out[col] = pd.to_numeric(out[col], errors="coerce")

    if out["margin"].isna().all():
        out["margin"] = out["selling_price"] - out["cost_price"]

    if out["margin_pct"].isna().all():
        out["margin_pct"] = ((out["margin"] / out["selling_price"].replace(0, np.nan)) * 100.0).fillna(0.0)

    if out["inventory_value"].isna().all():
        out["inventory_value"] = (out["current_stock"] * out["cost_price"]).fillna(0.0)

    if out["days_of_stock_left"].isna().all():
        out["days_of_stock_left"] = (
            out["current_stock"] / out["rolling_avg_7"].replace(0, np.nan)
        ).replace([np.inf, -np.inf], np.nan)

    return out


def engineer_features(df: pd.DataFrame) -> pd.DataFrame:
    out = df.copy()

    out["month_sin"] = np.sin(2 * np.pi * out["month"] / 12.0)
    out["month_cos"] = np.cos(2 * np.pi * out["month"] / 12.0)
    out["dow_sin"] = np.sin(2 * np.pi * out["day_of_week"] / 7.0)
    out["dow_cos"] = np.cos(2 * np.pi * out["day_of_week"] / 7.0)

    out["demand_momentum"] = (out["rolling_avg_7"] / (out["rolling_avg_14"] + 1e-5)).clip(0, 3)
    out["stock_pressure"] = (out["current_stock"] / (out["reorder_level"] + 1)).clip(0, 10)
    out["budget_utilization"] = (out["inventory_value"] / (out["available_budget"] + 1)).clip(0, 5)
    out["heat_humidity_index"] = (out["temperature_c"] * out["humidity_pct"]) / 100.0

    return out


def time_split(
    df: pd.DataFrame,
    target: str,
    validation_days: int,
    train_end_date: Optional[str],
) -> Tuple[pd.DataFrame, pd.DataFrame, pd.Timestamp]:
    work = df[df[target].notna()].copy()
    if work.empty:
        raise ValueError("No non-null target rows available after preprocessing.")

    if train_end_date:
        cutoff = pd.to_datetime(train_end_date)
    else:
        cutoff = work["date"].max() - pd.Timedelta(days=max(1, validation_days))

    train = work[work["date"] <= cutoff].copy()
    val = work[work["date"] > cutoff].copy()

    if train.empty or val.empty:
        unique_dates = sorted(pd.to_datetime(work["date"]).dropna().unique())
        if len(unique_dates) < 3:
            raise ValueError("Not enough unique dates for a time-based split.")
        split_idx = max(1, int(len(unique_dates) * 0.8))
        cutoff = pd.Timestamp(unique_dates[split_idx - 1])
        train = work[work["date"] <= cutoff].copy()
        val = work[work["date"] > cutoff].copy()

    if train.empty or val.empty:
        raise ValueError("Failed to build non-empty train and validation sets.")

    return train, val, cutoff


def fit_encoders(train_df: pd.DataFrame) -> Dict[str, Dict[str, int]]:
    encoders: Dict[str, Dict[str, int]] = {}

    for col in RAW_CATEGORICAL_COLUMNS:
        categories = sorted(train_df[col].fillna("unknown").astype(str).unique().tolist())
        mapping = {label: idx for idx, label in enumerate(categories)}
        encoders[col] = mapping

    return encoders


def apply_encoders(df: pd.DataFrame, encoders: Dict[str, Dict[str, int]]) -> pd.DataFrame:
    out = df.copy()

    for col, mapping in encoders.items():
        source = out[col].fillna("unknown").astype(str)
        out[f"{col}_enc"] = source.map(mapping).fillna(-1).astype(np.int32)

    return out


def ensure_model_features(df: pd.DataFrame) -> pd.DataFrame:
    out = df.copy()
    for col in MODEL_FEATURES:
        if col not in out.columns:
            out[col] = 0.0

    return out


def make_feature_matrices(train_df: pd.DataFrame, val_df: pd.DataFrame) -> Tuple[pd.DataFrame, pd.DataFrame]:
    x_train = train_df[MODEL_FEATURES].copy()
    x_val = val_df[MODEL_FEATURES].copy()

    for frame in (x_train, x_val):
        frame.replace([np.inf, -np.inf], np.nan, inplace=True)
        for col in frame.columns:
            frame[col] = pd.to_numeric(frame[col], errors="coerce")

    medians = x_train.median(numeric_only=True)
    x_train = x_train.fillna(medians).fillna(0.0).astype(np.float32)
    x_val = x_val.fillna(medians).fillna(0.0).astype(np.float32)

    return x_train, x_val


def compute_recency_weights(date_series: pd.Series, half_life_days: float) -> np.ndarray:
    half_life_days = max(float(half_life_days), 1.0)
    latest_date = pd.to_datetime(date_series).max()
    age_days = (latest_date - pd.to_datetime(date_series)).dt.days.clip(lower=0)
    weights = np.power(0.5, age_days / half_life_days)
    return np.clip(weights, 0.15, 1.0).astype(np.float32)


def metrics(y_true: np.ndarray, y_pred: np.ndarray) -> Dict[str, float]:
    err = np.abs(y_true - y_pred)
    mae = float(mean_absolute_error(y_true, y_pred))
    rmse = float(np.sqrt(mean_squared_error(y_true, y_pred)))
    mape = float(np.mean(err / (np.abs(y_true) + 1.0)) * 100.0)
    wmape = float((np.sum(err) / (np.sum(np.abs(y_true)) + 1e-9)) * 100.0)

    return {
        "mae": mae,
        "rmse": rmse,
        "mape": mape,
        "wmape": wmape,
    }


def detect_lightgbm_gpu(seed: int) -> bool:
    try:
        import lightgbm as lgb

        x_probe = np.array([[0.0], [1.0], [2.0], [3.0]], dtype=np.float32)
        y_probe = np.array([0.0, 1.0, 2.0, 3.0], dtype=np.float32)

        model = lgb.LGBMRegressor(
            objective="regression",
            n_estimators=2,
            learning_rate=0.1,
            num_leaves=8,
            random_state=seed,
            device_type="gpu",
            verbosity=-1,
        )
        model.fit(x_probe, y_probe)
        return True
    except Exception:
        return False


def detect_xgboost_gpu(seed: int) -> bool:
    try:
        from xgboost import XGBRegressor

        x_probe = np.array([[0.0], [1.0], [2.0], [3.0]], dtype=np.float32)
        y_probe = np.array([0.0, 1.0, 2.0, 3.0], dtype=np.float32)

        model = XGBRegressor(
            objective="reg:squarederror",
            n_estimators=2,
            max_depth=2,
            learning_rate=0.1,
            tree_method="hist",
            device="cuda",
            random_state=seed,
            verbosity=0,
        )
        model.fit(x_probe, y_probe, verbose=False)
        return True
    except Exception:
        return False


def sample_lgb_params(rng: random.Random, seed: int, use_gpu: bool) -> Dict[str, float]:
    params = {
        "objective": "regression",
        "n_estimators": rng.choice([700, 900, 1200, 1500]),
        "learning_rate": rng.choice([0.02, 0.03, 0.05, 0.07]),
        "num_leaves": rng.choice([31, 63, 95, 127, 191]),
        "max_depth": rng.choice([-1, 6, 8, 10, 12]),
        "min_child_samples": rng.choice([10, 20, 30, 50, 80]),
        "subsample": rng.choice([0.7, 0.8, 0.9, 1.0]),
        "subsample_freq": rng.choice([1, 3, 5, 7]),
        "colsample_bytree": rng.choice([0.7, 0.8, 0.9, 1.0]),
        "reg_alpha": rng.choice([0.0, 0.05, 0.1, 0.2, 0.4]),
        "reg_lambda": rng.choice([0.0, 0.05, 0.1, 0.2, 0.4]),
        "random_state": seed,
        "n_jobs": -1,
        "verbosity": -1,
    }

    if use_gpu:
        params["device_type"] = "gpu"

    return params


def train_lightgbm(
    x_train: pd.DataFrame,
    y_train: np.ndarray,
    x_val: pd.DataFrame,
    y_val: np.ndarray,
    sample_weight: np.ndarray,
    trials: int,
    seed: int,
    use_gpu: bool,
) -> Dict[str, object]:
    try:
        import lightgbm as lgb
    except ImportError as exc:
        raise RuntimeError("LightGBM is required. Install it with: pip install lightgbm") from exc

    rng = random.Random(seed)
    trials = max(1, int(trials))
    best: Optional[Dict[str, object]] = None

    for idx in range(1, trials + 1):
        params = sample_lgb_params(rng, seed, use_gpu=use_gpu)
        model = lgb.LGBMRegressor(**params)
        model.fit(
            x_train,
            y_train,
            sample_weight=sample_weight,
            eval_set=[(x_val, y_val)],
            eval_metric="l1",
            callbacks=[lgb.early_stopping(stopping_rounds=100, verbose=False)],
        )

        pred = model.predict(x_val, num_iteration=getattr(model, "best_iteration_", None))
        pred = np.maximum(0.0, pred)
        score = metrics(y_val, pred)

        if best is None or score["mae"] < best["metrics"]["mae"]:
            best = {
                "model": model,
                "params": params,
                "predictions": pred,
                "metrics": score,
            }

        if idx == 1 or idx % 5 == 0 or idx == trials:
            print(f"[lightgbm] trial {idx}/{trials} | best MAE: {best['metrics']['mae']:.4f}")

    return best


def sample_xgb_params(rng: random.Random, seed: int, use_gpu: bool) -> Dict[str, float]:
    params = {
        "objective": "reg:squarederror",
        "eval_metric": "mae",
        "tree_method": "hist",
        "n_estimators": rng.choice([600, 900, 1200]),
        "learning_rate": rng.choice([0.02, 0.03, 0.05, 0.07]),
        "max_depth": rng.choice([4, 6, 8, 10]),
        "min_child_weight": rng.choice([1, 3, 5, 8]),
        "subsample": rng.choice([0.7, 0.8, 0.9, 1.0]),
        "colsample_bytree": rng.choice([0.7, 0.8, 0.9, 1.0]),
        "gamma": rng.choice([0.0, 0.1, 0.2, 0.4]),
        "reg_alpha": rng.choice([0.0, 0.05, 0.1, 0.2]),
        "reg_lambda": rng.choice([0.5, 1.0, 1.5, 2.0]),
        "random_state": seed,
        "n_jobs": -1,
        "verbosity": 0,
    }

    if use_gpu:
        params["device"] = "cuda"

    return params


def train_xgboost(
    x_train: pd.DataFrame,
    y_train: np.ndarray,
    x_val: pd.DataFrame,
    y_val: np.ndarray,
    sample_weight: np.ndarray,
    trials: int,
    seed: int,
    use_gpu: bool,
) -> Dict[str, object]:
    try:
        from xgboost import XGBRegressor
    except ImportError as exc:
        raise RuntimeError("XGBoost is required. Install it with: pip install xgboost") from exc

    rng = random.Random(seed + 1000)
    trials = max(1, int(trials))
    best: Optional[Dict[str, object]] = None

    for idx in range(1, trials + 1):
        params = sample_xgb_params(rng, seed, use_gpu=use_gpu)
        model = XGBRegressor(**params)
        model.fit(x_train, y_train, sample_weight=sample_weight, eval_set=[(x_val, y_val)], verbose=False)

        pred = np.maximum(0.0, model.predict(x_val))
        score = metrics(y_val, pred)

        if best is None or score["mae"] < best["metrics"]["mae"]:
            best = {
                "model": model,
                "params": params,
                "predictions": pred,
                "metrics": score,
            }

        if idx == 1 or idx % 5 == 0 or idx == trials:
            print(f"[xgboost] trial {idx}/{trials} | best MAE: {best['metrics']['mae']:.4f}")

    return best


def select_best_prediction(
    y_val: np.ndarray,
    lgb_result: Dict[str, object],
    xgb_result: Optional[Dict[str, object]],
) -> Tuple[np.ndarray, Dict[str, object], Dict[str, float]]:
    lgb_pred = np.asarray(lgb_result["predictions"], dtype=np.float32)

    if xgb_result is None:
        final_metrics = metrics(y_val, lgb_pred)
        return lgb_pred, {"strategy": "lightgbm", "lgb_weight": 1.0, "xgb_weight": 0.0}, final_metrics

    xgb_pred = np.asarray(xgb_result["predictions"], dtype=np.float32)

    best_blend = {
        "mae": float("inf"),
        "lgb_weight": 1.0,
        "xgb_weight": 0.0,
        "pred": lgb_pred,
    }

    for lgb_weight in np.linspace(0.0, 1.0, 21):
        blended = (lgb_weight * lgb_pred) + ((1.0 - lgb_weight) * xgb_pred)
        blend_mae = mean_absolute_error(y_val, blended)
        if blend_mae < best_blend["mae"]:
            best_blend = {
                "mae": float(blend_mae),
                "lgb_weight": float(lgb_weight),
                "xgb_weight": float(1.0 - lgb_weight),
                "pred": blended,
            }

    lgb_mae = float(lgb_result["metrics"]["mae"])
    xgb_mae = float(xgb_result["metrics"]["mae"])

    if best_blend["mae"] <= min(lgb_mae, xgb_mae):
        chosen_pred = best_blend["pred"]
        strategy = {
            "strategy": "blend",
            "lgb_weight": best_blend["lgb_weight"],
            "xgb_weight": best_blend["xgb_weight"],
        }
    elif lgb_mae <= xgb_mae:
        chosen_pred = lgb_pred
        strategy = {"strategy": "lightgbm", "lgb_weight": 1.0, "xgb_weight": 0.0}
    else:
        chosen_pred = xgb_pred
        strategy = {"strategy": "xgboost", "lgb_weight": 0.0, "xgb_weight": 1.0}

    final_metrics = metrics(y_val, chosen_pred)
    return chosen_pred, strategy, final_metrics


def append_training_history(history_path: Path, row: Dict[str, object]) -> None:
    row_df = pd.DataFrame([row])
    if history_path.exists():
        prev = pd.read_csv(history_path)
        out = pd.concat([prev, row_df], ignore_index=True)
    else:
        out = row_df
    out.to_csv(history_path, index=False)


def save_artifacts(
    artifacts_dir: Path,
    dataset_path: Path,
    target: str,
    train_df: pd.DataFrame,
    val_df: pd.DataFrame,
    cutoff: pd.Timestamp,
    encoders: Dict[str, Dict[str, int]],
    lgb_result: Dict[str, object],
    xgb_result: Optional[Dict[str, object]],
    selection: Dict[str, object],
    final_metrics: Dict[str, float],
) -> None:
    artifacts_dir.mkdir(parents=True, exist_ok=True)

    lgb_model_path = artifacts_dir / "lightgbm_model.txt"
    lgb_result["model"].booster_.save_model(str(lgb_model_path))

    xgb_model_path = None
    if xgb_result is not None:
        xgb_model_path = artifacts_dir / "xgboost_model.json"
        xgb_result["model"].save_model(str(xgb_model_path))

    with (artifacts_dir / "encoders.json").open("w", encoding="utf-8") as fp:
        json.dump(encoders, fp, indent=2)

    with (artifacts_dir / "feature_schema.json").open("w", encoding="utf-8") as fp:
        json.dump({"target": target, "features": MODEL_FEATURES}, fp, indent=2)

    trained_at = datetime.now(timezone.utc).replace(microsecond=0).isoformat()
    summary = {
        "trained_at_utc": trained_at,
        "dataset_path": str(dataset_path),
        "target": target,
        "rows": {
            "train": int(len(train_df)),
            "validation": int(len(val_df)),
        },
        "validation_cutoff": str(cutoff.date()),
        "lightgbm": {
            "metrics": lgb_result["metrics"],
            "params": lgb_result["params"],
            "model_path": str(lgb_model_path),
        },
        "xgboost": None,
        "selection": selection,
        "final_metrics": final_metrics,
    }

    if xgb_result is not None:
        summary["xgboost"] = {
            "metrics": xgb_result["metrics"],
            "params": xgb_result["params"],
            "model_path": str(xgb_model_path),
        }

    with (artifacts_dir / "training_summary.json").open("w", encoding="utf-8") as fp:
        json.dump(summary, fp, indent=2)

    append_training_history(
        artifacts_dir / "training_history.csv",
        {
            "trained_at_utc": trained_at,
            "dataset_path": str(dataset_path),
            "target": target,
            "train_rows": len(train_df),
            "val_rows": len(val_df),
            "cutoff_date": str(cutoff.date()),
            "strategy": selection["strategy"],
            "lgb_weight": selection["lgb_weight"],
            "xgb_weight": selection["xgb_weight"],
            "mae": final_metrics["mae"],
            "rmse": final_metrics["rmse"],
            "mape": final_metrics["mape"],
            "wmape": final_metrics["wmape"],
        },
    )


def main() -> None:
    args = parse_args()
    random.seed(args.seed)
    np.random.seed(args.seed)

    script_dir = Path(__file__).resolve().parent
    dataset_path = resolve_csv_path(
        path_arg=args.dataset,
        script_dir=script_dir,
        fallback_names=["data.csv", "mediflow_demand_dataset.csv"],
    )

    print("=" * 80)
    print("MediFlow Demand Forecast Training")
    print("=" * 80)
    print(f"[info] Dataset: {dataset_path}")

    df = load_dataset(dataset_path, max_rows=args.max_rows)

    if args.new_data:
        new_data_path = resolve_csv_path(
            path_arg=args.new_data,
            script_dir=script_dir,
            fallback_names=[],
        )
        print(f"[info] Merging new seeded data: {new_data_path}")
        new_df = load_dataset(new_data_path, max_rows=None)

        before = len(df)
        df = merge_new_data(df, new_df)
        after = len(df)
        print(f"[info] Rows before merge: {before:,} | after merge: {after:,}")

        if args.persist_merged:
            df.to_csv(dataset_path, index=False)
            print(f"[info] Persisted merged dataset to: {dataset_path}")

    print(f"[info] Raw rows loaded: {len(df):,}")

    df = ensure_calendar_columns(df)
    df = ensure_core_columns(df, target=args.target)
    df = engineer_features(df)

    train_df, val_df, cutoff = time_split(
        df=df,
        target=args.target,
        validation_days=args.validation_days,
        train_end_date=args.train_end_date,
    )

    print(
        "[info] Time split | "
        f"train: {len(train_df):,} ({train_df['date'].min().date()} -> {train_df['date'].max().date()}) | "
        f"val: {len(val_df):,} ({val_df['date'].min().date()} -> {val_df['date'].max().date()})"
    )

    encoders = fit_encoders(train_df)
    train_df = apply_encoders(train_df, encoders)
    val_df = apply_encoders(val_df, encoders)

    train_df = ensure_model_features(train_df)
    val_df = ensure_model_features(val_df)

    x_train, x_val = make_feature_matrices(train_df, val_df)
    y_train = pd.to_numeric(train_df[args.target], errors="coerce").fillna(0.0).to_numpy(dtype=np.float32)
    y_val = pd.to_numeric(val_df[args.target], errors="coerce").fillna(0.0).to_numpy(dtype=np.float32)

    recency_weight = compute_recency_weights(train_df["date"], half_life_days=args.half_life_days)
    print(f"[info] Recency weighting active with half-life: {args.half_life_days} days")

    lgb_use_gpu = detect_lightgbm_gpu(args.seed)
    xgb_use_gpu = detect_xgboost_gpu(args.seed) if args.use_xgboost else False
    print(f"[info] LightGBM backend: {'GPU' if lgb_use_gpu else 'CPU'}")
    if args.use_xgboost:
        print(f"[info] XGBoost backend: {'GPU' if xgb_use_gpu else 'CPU'}")

    lgb_result = train_lightgbm(
        x_train=x_train,
        y_train=y_train,
        x_val=x_val,
        y_val=y_val,
        sample_weight=recency_weight,
        trials=args.tune_trials,
        seed=args.seed,
        use_gpu=lgb_use_gpu,
    )

    xgb_result = None
    if args.use_xgboost:
        xgb_trials = max(6, args.tune_trials // 2)
        xgb_result = train_xgboost(
            x_train=x_train,
            y_train=y_train,
            x_val=x_val,
            y_val=y_val,
            sample_weight=recency_weight,
            trials=xgb_trials,
            seed=args.seed,
            use_gpu=xgb_use_gpu,
        )

    _, selection, final_metrics = select_best_prediction(y_val, lgb_result, xgb_result)

    artifacts_dir = Path(args.artifacts_dir)
    if not artifacts_dir.is_absolute():
        artifacts_dir = script_dir / artifacts_dir

    save_artifacts(
        artifacts_dir=artifacts_dir,
        dataset_path=dataset_path,
        target=args.target,
        train_df=train_df,
        val_df=val_df,
        cutoff=cutoff,
        encoders=encoders,
        lgb_result=lgb_result,
        xgb_result=xgb_result,
        selection=selection,
        final_metrics=final_metrics,
    )

    print("\n" + "-" * 80)
    print("Best Validation Metrics")
    print("-" * 80)
    print(f"Strategy : {selection['strategy']} (LGB={selection['lgb_weight']:.2f}, XGB={selection['xgb_weight']:.2f})")
    print(f"MAE      : {final_metrics['mae']:.4f}")
    print(f"RMSE     : {final_metrics['rmse']:.4f}")
    print(f"MAPE     : {final_metrics['mape']:.2f}%")
    print(f"WMAPE    : {final_metrics['wmape']:.2f}%")

    print("\nArtifacts saved to:")
    print(f"  {artifacts_dir}")
    print("  - lightgbm_model.txt")
    print("  - xgboost_model.json (if --use-xgboost)")
    print("  - encoders.json")
    print("  - feature_schema.json")
    print("  - training_summary.json")
    print("  - training_history.csv")

    print("\nContinuous improvement workflow:")
    print("1) Export fresh seeded rows from DB into CSV")
    print("2) Re-run training with --new-data <csv> --persist-merged")
    print("3) Track MAE/WMAPE trend inside training_history.csv")


if __name__ == "__main__":
    main()
