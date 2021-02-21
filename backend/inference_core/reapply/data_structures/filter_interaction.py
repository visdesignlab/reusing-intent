from typing import List

import pandas as pd

from backend.inference_core.reapply.compare import get_changes_df
from backend.inference_core.reapply.data_structures.base_interaction import (
    BaseInteraction,
)
from backend.inference_core.reapply.data_structures.types import InteractionType


class FilterInteraction(BaseInteraction):
    def __init__(self, id, type, points, **kwargs):
        super().__init__(id, type)
        self.points: List[str] = points
        self.dependencies = [
            InteractionType.ADD_PLOT,
            InteractionType.POINT_SELECTION,
            InteractionType.BRUSH,
            InteractionType.SELECT_PREDICTION,
        ]

    def apply(self, base: pd.DataFrame, updated: pd.DataFrame):
        results = self.apply_parent(base, updated)

        changes = get_changes_df(
            base[base.id.isin(self.points)],  # type: ignore
            updated[updated.id.isin(results.selected_points)],  # type: ignore
        )

        results.add_change_record(self.id, changes)

        return results
