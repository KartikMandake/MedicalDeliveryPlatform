"""
MediFlow model inference bridge.

Reads payload JSON from stdin or --input-json path:
{
  "rows": [{... feature columns ...}],
  "target": "units_sold_today"
}

Outputs JSON:
{
  "success": true,
  "count": 120,
  "predictions": [1.2, 0.8, ...],
  "selection": {"strategy": "blend", "lgb_weight": 0.6, "xgb_weight": 0.4}
}
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

import lightgbm as lgb
import numpy as np
import pandas as pd

try:
    import xgboost as xgb
except Exception:  # pragma: no cover - xgboost is optional at runtime.
    xgb = None

from mediflow_model_training import (
    MODEL_FEATURES,
    RAW_CATEGORICAL_COLUMNS,
    RAW_NUMERIC_COLUMNS,
    apply_encoders,
    engineer_features,
    ensure_calendar_columns,
    ensure_model_features,
)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Run inference using MediFlow artifacts")
    parser.add_argument(
        "--artifacts-dir",
        type=str,
        default="artifacts",
        help="Path containing lightgbm_model.txt, encoders.json, and training_summary.json",
    )
    parser.add_argument(
        "--input-json",
        type=str,
        default=None,
        help="Optional JSON file path. If omitted, reads payload from stdin.",
    )
    parser.add_argument(
        "--target",
        type=str,
        default=None,
        help="Optional target override. Defaults to artifact target.",
    )
    return parser.parse_args()


def load_payload(input_json_path: Optional[str]) -> Dict[str, Any]:
    raw = ""
    if input_json_path:
        raw = Path(input_json_path).read_text(encoding="utf-8")
    else:
        raw = sys.stdin.read()

    if not raw.strip():
        raise ValueError("Inference payload is empty")

    payload = json.loads(raw)
    if not isinstance(payload, dict):
        raise ValueError("Payload must be a JSON object")

    rows = payload.get("rows")
    if not isinstance(rows, list):
        raise ValueError("Payload must include 'rows' as an array")

    return payload


def safe_float(value: Any, fallback: float = 0.0) -> float:
    try:
        numeric = float(value)
    except (TypeError, ValueError):
        return fallback
    if np.isfinite(numeric):
        return numeric
    return fallback


def ensure_inference_columns(df: pd.DataFrame, target: str) -> pd.DataFrame:
    out = df.copy()

    if "date" not in out.columns:
        out["date"] = pd.Timestamp.utcnow().normalize()

    out["date"] = pd.to_datetime(out["date"], errors="coerce")
    out["date"] = out["date"].fillna(pd.Timestamp.utcnow().normalize())

    out = ensure_calendar_columns(out)

    for col in RAW_CATEGORICAL_COLUMNS:
        if col not in out.columns:
            out[col] = "unknown"
        out[col] = out[col].fillna("unknown").astype(str).str.strip().replace("", "unknown")

    for col in RAW_NUMERIC_COLUMNS:
        if col not in out.columns:
            out[col] = np.nan
        out[col] = pd.to_numeric(out[col], errors="coerce")

    if target not in out.columns:
        out[target] = np.nan

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


def load_json_file(path: Path) -> Dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8"))


def resolve_selection(summary: Dict[str, Any]) -> Dict[str, float]:
    selection = summary.get("selection") if isinstance(summary, dict) else None
    if not isinstance(selection, dict):
        return {"strategy": "lightgbm", "lgb_weight": 1.0, "xgb_weight": 0.0}

    return {
        "strategy": str(selection.get("strategy", "lightgbm")),
        "lgb_weight": safe_float(selection.get("lgb_weight"), 1.0),
        "xgb_weight": safe_float(selection.get("xgb_weight"), 0.0),
    }


def load_target_encodings(path: Path) -> Optional[Dict[str, Any]]:
    if not path.exists():
        return None

    raw = load_json_file(path)
    if not isinstance(raw, dict):
        return None

    maps = raw.get("maps")
    if not isinstance(maps, dict):
        return None

    normalized_maps: Dict[str, Dict[str, float]] = {}
    for group_name, mapping in maps.items():
        if not isinstance(mapping, dict):
            continue
        normalized_maps[str(group_name)] = {
            str(key): safe_float(value, 0.0)
            for key, value in mapping.items()
        }

    return {
        "global_mean": safe_float(raw.get("global_mean"), 0.0),
        "maps": normalized_maps,
    }


def apply_target_encodings_from_artifacts(
    df: pd.DataFrame,
    target_encodings: Optional[Dict[str, Any]],
) -> pd.DataFrame:
    out = df.copy()

    if not target_encodings:
        return out

    global_mean = safe_float(target_encodings.get("global_mean"), 0.0)
    maps = target_encodings.get("maps")
    if not isinstance(maps, dict):
        return out

    medicine_map = maps.get("medicine_id") if isinstance(maps.get("medicine_id"), dict) else {}
    retailer_map = maps.get("retailer_id") if isinstance(maps.get("retailer_id"), dict) else {}
    category_map = maps.get("category_name") if isinstance(maps.get("category_name"), dict) else {}
    med_retailer_map = maps.get("medicine_id__retailer_id") if isinstance(maps.get("medicine_id__retailer_id"), dict) else {}

    if "medicine_id" in out.columns:
        medicine_key = out["medicine_id"].astype(str)
        out["medicine_target_enc"] = medicine_key.map(medicine_map).fillna(global_mean).astype(np.float32)
    else:
        out["medicine_target_enc"] = np.float32(global_mean)

    if "retailer_id" in out.columns:
        retailer_key = out["retailer_id"].astype(str)
        out["retailer_target_enc"] = retailer_key.map(retailer_map).fillna(global_mean).astype(np.float32)
    else:
        out["retailer_target_enc"] = np.float32(global_mean)

    if "category_name" in out.columns:
        category_key = out["category_name"].astype(str)
        out["category_target_enc"] = category_key.map(category_map).fillna(global_mean).astype(np.float32)
    else:
        out["category_target_enc"] = np.float32(global_mean)

    if "medicine_id" in out.columns and "retailer_id" in out.columns:
        med_retailer_key = out["medicine_id"].astype(str) + "__" + out["retailer_id"].astype(str)
        out["med_retailer_target_enc"] = med_retailer_key.map(med_retailer_map).fillna(global_mean).astype(np.float32)
    else:
        out["med_retailer_target_enc"] = np.float32(global_mean)

    return out


def load_models(
    artifacts_dir: Path,
) -> Tuple[
    lgb.Booster,
    Optional[Any],
    Dict[str, float],
    Dict[str, Any],
    Dict[str, Dict[str, int]],
    Optional[Dict[str, Any]],
]:
    lgb_path = artifacts_dir / "lightgbm_model.txt"
    encoders_path = artifacts_dir / "encoders.json"
    schema_path = artifacts_dir / "feature_schema.json"
    summary_path = artifacts_dir / "training_summary.json"
    target_enc_path = artifacts_dir / "target_encodings.json"
    xgb_path = artifacts_dir / "xgboost_model.json"

    if not lgb_path.exists():
        raise FileNotFoundError(f"Missing model file: {lgb_path}")
    if not encoders_path.exists():
        raise FileNotFoundError(f"Missing encoders file: {encoders_path}")

    lgb_model = lgb.Booster(model_file=str(lgb_path))
    encoders = load_json_file(encoders_path)

    schema = {"target": "units_sold_today", "features": MODEL_FEATURES}
    if schema_path.exists():
        loaded = load_json_file(schema_path)
        if isinstance(loaded, dict):
            schema.update(loaded)

    summary = {}
    if summary_path.exists():
        loaded = load_json_file(summary_path)
        if isinstance(loaded, dict):
            summary = loaded

    selection = resolve_selection(summary)
    target_encodings = load_target_encodings(target_enc_path)

    xgb_model = None
    if xgb is not None and xgb_path.exists() and selection.get("xgb_weight", 0.0) > 0:
        xgb_model = xgb.Booster()
        xgb_model.load_model(str(xgb_path))

    return lgb_model, xgb_model, selection, schema, encoders, target_encodings


def make_feature_matrix(
    rows: List[Dict[str, Any]],
    target: str,
    feature_list: List[str],
    encoders: Dict[str, Dict[str, int]],
    target_encodings: Optional[Dict[str, Any]],
) -> pd.DataFrame:
    df = pd.DataFrame(rows)
    df = ensure_inference_columns(df, target=target)
    df = engineer_features(df)
    df = apply_encoders(df, encoders)
    df = apply_target_encodings_from_artifacts(df, target_encodings)
    df = ensure_model_features(df)

    missing = [feature for feature in feature_list if feature not in df.columns]
    for feature in missing:
        df[feature] = 0.0

    matrix = df[feature_list].copy()
    matrix.replace([np.inf, -np.inf], np.nan, inplace=True)

    for col in matrix.columns:
        matrix[col] = pd.to_numeric(matrix[col], errors="coerce")

    medians = matrix.median(numeric_only=True)
    matrix = matrix.fillna(medians).fillna(0.0).astype(np.float32)

    return matrix


def blend_predictions(
    matrix: pd.DataFrame,
    lgb_model: lgb.Booster,
    xgb_model: Optional[Any],
    selection: Dict[str, float],
) -> np.ndarray:
    lgb_pred = np.asarray(lgb_model.predict(matrix), dtype=np.float32)

    xgb_weight = float(selection.get("xgb_weight", 0.0))
    if xgb_model is None or xgb_weight <= 0:
        return np.clip(lgb_pred, 0, None)

    lgb_weight = float(selection.get("lgb_weight", 1.0))
    dmatrix = xgb.DMatrix(matrix.values, feature_names=list(matrix.columns))
    xgb_pred = np.asarray(xgb_model.predict(dmatrix), dtype=np.float32)

    blended = (lgb_weight * lgb_pred) + (xgb_weight * xgb_pred)
    return np.clip(blended, 0, None)


def to_float_list(values: np.ndarray) -> List[float]:
    return [float(np.round(v, 6)) for v in values]


def main() -> None:
    args = parse_args()

    try:
        artifacts_dir = Path(args.artifacts_dir)
        if not artifacts_dir.is_absolute():
            artifacts_dir = (Path(__file__).resolve().parent / artifacts_dir).resolve()

        payload = load_payload(args.input_json)
        rows = payload.get("rows", [])

        if len(rows) == 0:
            print(
                json.dumps(
                    {
                        "success": True,
                        "count": 0,
                        "predictions": [],
                        "selection": {"strategy": "lightgbm", "lgb_weight": 1.0, "xgb_weight": 0.0},
                    }
                )
            )
            return

        lgb_model, xgb_model, selection, schema, encoders, target_encodings = load_models(artifacts_dir)
        target = args.target or payload.get("target") or str(schema.get("target", "units_sold_today"))
        feature_list = schema.get("features")
        if not isinstance(feature_list, list) or not feature_list:
            feature_list = MODEL_FEATURES
        log_target = bool(schema.get("log_target", False))

        effective_selection = dict(selection)
        if xgb_model is None and float(selection.get("xgb_weight", 0.0)) > 0:
            effective_selection = {
                "strategy": "lightgbm-fallback",
                "lgb_weight": 1.0,
                "xgb_weight": 0.0,
            }

        matrix = make_feature_matrix(
            rows=rows,
            target=target,
            feature_list=[str(name) for name in feature_list],
            encoders=encoders,
            target_encodings=target_encodings,
        )

        predictions = blend_predictions(
            matrix,
            lgb_model=lgb_model,
            xgb_model=xgb_model,
            selection=effective_selection,
        )
        if log_target:
            predictions = np.expm1(predictions)
        predictions = np.clip(predictions, 0, None)

        result = {
            "success": True,
            "count": len(predictions),
            "predictions": to_float_list(predictions),
            "selection": effective_selection,
            "target": target,
            "log_target_applied": log_target,
        }
        print(json.dumps(result))
    except Exception as exc:
        print(json.dumps({"success": False, "error": str(exc)}))
        sys.exit(1)


if __name__ == "__main__":
    main()
