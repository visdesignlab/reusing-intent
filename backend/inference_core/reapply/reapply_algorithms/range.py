from typing import Any, List

import pandas as pd

from backend.inference_core.algorithms.range import get_mask_from_rules


def apply_range(data: pd.DataFrame, rules: List[Any]):
    mask = get_mask_from_rules(data, rules)
    return data[mask].id.tolist()
