from typing import List

import pandas as pd

from backend.inference_core.reapply.compare import get_changes_df
from backend.inference_core.reapply.data_structures.base_interaction import (
    BaseInteraction,
)
from backend.inference_core.reapply.data_structures.types import InteractionType


class FilterInteraction(BaseInteraction):
    def __init__(self, id, type, points, filterType, **kwargs):
        super().__init__(id, type)
        self.points: List[str] = points
        self.filterType = filterType
        self.dependencies = [
            InteractionType.ADD_PLOT,
            InteractionType.POINT_SELECTION,
            InteractionType.BRUSH,
            InteractionType.SELECT_PREDICTION,
        ]

    def apply(self, base: pd.DataFrame, updated: pd.DataFrame):
        results = self.apply_parent(base, updated)

        changes = None

        if self.filterType == "Out":
            changes = get_changes_df(
                base[base.id.isin(self.points)],  # type: ignore
                updated[updated.id.isin(results.selected_points)],  # type: ignore
            )
            changes.set_result(
                updated[~updated.id.isin(results.selected_points)].id.values.tolist()
            )
        else:
            changes = get_changes_df(
                base[~base.id.isin(self.points)],  # type: ignore
                updated[~updated.id.isin(results.selected_points)],  # type: ignore
            )
            changes.set_result(results.selected_points)

        results.add_change_record(self.id, changes)

        return results
