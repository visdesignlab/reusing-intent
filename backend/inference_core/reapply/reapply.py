from typing import Any, List

import pandas as pd

from backend.inference_core.reapply.compare import (
    get_changes_brush,
    get_changes_df,
    get_changes_point_selection,
)
from backend.inference_core.reapply.interactions import (
    ADD_PLOT,
    BRUSH,
    POINT_SELECTION,
    SELECT_PREDICTION,
)
from backend.inference_core.reapply.reapply_algorithms.algorithm_picker import (
    apply_prediction,
)


def reapply(base: pd.DataFrame, updated: pd.DataFrame, interactions: List[Any]):
    application: dict = {}

    for interaction in interactions:
        actionType = interaction["type"]
        id = interaction["id"]
        changes = None
        if actionType == ADD_PLOT:
            changes = get_changes_df(base, updated)
        if actionType == POINT_SELECTION:
            selections = interaction["selected"]
            changes = get_changes_point_selection(base, updated, selections)
        if actionType == BRUSH:
            brushId = interaction["brush"]
            changes = get_changes_brush(base, updated, interaction["plot"], brushId)
        if actionType == SELECT_PREDICTION:
            prediction = interaction["prediction"]
            changes = apply_prediction(base, updated, prediction)
        application[id] = changes

    return application
