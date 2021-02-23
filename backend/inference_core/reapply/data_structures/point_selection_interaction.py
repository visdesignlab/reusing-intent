import pandas as pd

from backend.inference_core.reapply.compare import get_changes_point_selection
from backend.inference_core.reapply.data_structures.base_interaction import (
    BaseInteraction,
)
from backend.inference_core.reapply.data_structures.plot import Plot
from backend.inference_core.reapply.data_structures.types import InteractionType
from backend.utils.hash import getUIDForString


class PointSelectionInteraction(BaseInteraction):
    def __init__(self, id, type, selected, plot, **kwargs):
        super().__init__(id, type)
        self.selected = selected
        self.plot = Plot(**plot)
        self.dependencies = [
            InteractionType.ADD_PLOT,
            InteractionType.POINT_SELECTION,
            InteractionType.BRUSH,
            InteractionType.SELECT_PREDICTION,
        ]

    def apply(self, base: pd.DataFrame, updated: pd.DataFrame):
        results = self.apply_parent(base, updated)

        updated_selections = get_changes_point_selection(base, updated, self.selected)

        results.add_change_record(self.id, updated_selections)

        key = getUIDForString((f"{self.plot.id}_{','.join(updated_selections.result)}"))

        results.update_selections(key, updated_selections.result)

        return results
