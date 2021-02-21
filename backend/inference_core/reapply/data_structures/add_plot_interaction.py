import pandas as pd

from backend.inference_core.reapply.compare import get_changes_df
from backend.inference_core.reapply.data_structures.base_interaction import (
    BaseInteraction,
)
from backend.inference_core.reapply.data_structures.plot import Plot
from backend.inference_core.reapply.data_structures.types import InteractionType


class AddPlotInteraction(BaseInteraction):
    def __init__(self, id, type, plot, **kwargs):
        super().__init__(id, type)
        self.plot: Plot = Plot(**plot)
        self.dependencies = list(InteractionType.__members__.values())

    def apply(self, base: pd.DataFrame, updated: pd.DataFrame):
        results = self.apply_parent(base, updated)

        changes = get_changes_df(base, updated)
        results.add_change_record(self.id, changes)

        return results
