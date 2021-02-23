import pandas as pd

from backend.inference_core.reapply.compare import get_changes_brush
from backend.inference_core.reapply.data_structures.apply_results import Changes
from backend.inference_core.reapply.data_structures.base_interaction import (
    BaseInteraction,
)
from backend.inference_core.reapply.data_structures.plot import Plot
from backend.inference_core.reapply.data_structures.types import (
    BrushAction,
    InteractionType,
)


class BrushInteraction(BaseInteraction):
    def __init__(self, id, type, plot, brush, action, **kwargs):
        super().__init__(id, type)
        self.affected_brush_id: str = brush
        self.action: BrushAction = BrushAction(action)
        self.plot: Plot = Plot(**plot)
        self.dependencies = [
            InteractionType.ADD_PLOT,
            InteractionType.POINT_SELECTION,
            InteractionType.BRUSH,
            InteractionType.SELECT_PREDICTION,
        ]

    @property
    def affected_brush(self):
        return self.plot.get_brush_by_id(self.affected_brush_id)

    def apply(self, base: pd.DataFrame, updated: pd.DataFrame):
        results = self.apply_parent(base, updated)

        if self.action == BrushAction.ADD:
            changes = get_changes_brush(
                base, updated, self.plot, self.affected_brush_id, self.action.value
            )
            results.add_change_record(self.id, changes)
            results.update_selections(
                f"{self.plot.id}-{self.affected_brush_id}", changes.result
            )
        elif self.action == BrushAction.UPDATE:
            changes = get_changes_brush(
                base, updated, self.plot, self.affected_brush_id, self.action.value
            )
            results.add_change_record(self.id, changes)
            results.update_selections(
                f"{self.plot.id}-{self.affected_brush_id}", changes.result
            )
        else:
            changes = Changes(
                added=[],
                removed=[],
                changed=[],
                result=[],
                **{
                    "plot_id": self.plot.id,
                    "brush_id": self.affected_brush_id,
                    "type": self.action.value,
                },
            )
            results.add_change_record(self.id, changes)
            results.update_selections(f"{self.plot.id}-{self.affected_brush_id}", [])

        return results
