from typing import Any, List

import pandas as pd

from backend.inference_core.reapply.data_structures.interactions import Interactions


def reapply(base: pd.DataFrame, updated: pd.DataFrame, interactions: List[Any]):
    inters = Interactions(interactions)

    reapply_record = inters.reapply_interaction(base, updated)

    # for interaction in interactions:
    #     actionType = interaction["type"]
    #     id = interaction["id"]
    #     changes = None

    #     if actionType == InteractionType.ADD_PLOT.value:
    #         changes = get_changes_df(base, updated)
    #     if actionType == InteractionType.POINT_SELECTION.value:
    #         selections = interaction["selected"]
    #         changes = get_changes_point_selection(base, updated, selections)
    #     if actionType == InteractionType.BRUSH.value:
    #         brushId = interaction["brush"]
    #         changes = get_changes_brush(base, updated, interaction["plot"], brushId)
    #     if actionType == InteractionType.SELECT_PREDICTION.value:
    #         prediction = interaction["prediction"]
    #         changes = apply_prediction(base, updated, prediction)
    #     if actionType == InteractionType.FILTER.value:
    #         changes = {"added": [], "changed": [], "removed": []}
    #     application[id] = changes

    return reapply_record


class Reapply:
    def __init__(self, interaction_history, base_dataset):
        self.history = Interactions(interaction_history)
        self.base = base_dataset

    @property
    def interactions(self) -> List[str]:
        return self.interactions

    def apply(self, interaction: str, updated: pd.DataFrame):
        return self.history.reapply_interaction(self.base, updated, interaction)
