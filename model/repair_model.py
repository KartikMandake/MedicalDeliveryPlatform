import os
import sys
from pathlib import Path

def repair_lgb_model(input_path: Path, output_path: Path):
    if not input_path.exists():
        print(f"Error: {input_path} does not exist.")
        return False

    with open(input_path, "r", encoding="utf-8") as f:
        lines = f.readlines()

    keys = [
        "Tree=", "num_leaves=", "num_cat=", "split_feature=", "split_gain=", 
        "threshold=", "decision_type=", "left_child=", "right_child=", 
        "leaf_value=", "leaf_weight=", "leaf_count=", "internal_value=", 
        "internal_weight=", "internal_count=", "is_linear=", "shrinkage=",
        "version=", "num_class=", "num_tree_per_iteration=", "label_index=", 
        "max_feature_idx=", "objective=", "feature_names=", "feature_infos=", 
        "tree_sizes=", "pandas_categorical:", "tree", "end of parameters"
    ]

    repaired_lines = []
    current_line = ""

    for i, line in enumerate(lines):
        stripped = line.strip()
        if not stripped:
            if current_line:
                repaired_lines.append(current_line)
                current_line = ""
            repaired_lines.append("")
            continue

        # Check if the line starts a new key
        is_new_key = any(stripped.startswith(k) for k in keys)
        
        # Exception: first line is often just 'tree'
        if i == 0 and stripped == "tree":
            is_new_key = True

        if is_new_key:
            if current_line:
                repaired_lines.append(current_line)
            current_line = stripped
        else:
            # It's a continuation of the previous line
            if current_line:
                current_line += " " + stripped
            else:
                # Should not happen in a valid-ish file, but handle anyway
                current_line = stripped

    if current_line:
        repaired_lines.append(current_line)

    with open(output_path, "w", encoding="utf-8", newline="\n") as f:
        f.write("\n".join(repaired_lines))
    
    print(f"Successfully wrote repaired model to {output_path}")
    return True

if __name__ == "__main__":
    base_path = Path(__file__).parent
    input_file = base_path / "artifacts" / "lightgbm_model.txt"
    output_file = base_path / "artifacts" / "lightgbm_model.txt.fixed"
    
    if repair_lgb_model(input_file, output_file):
        print("Repair complete.")
    else:
        sys.exit(1)
