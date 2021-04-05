from backend.inference_core.reapply.data_structures.base_interaction import (
    BaseInteraction,
)
from backend.inference_core.reapply.data_structures.brush import Brush
from backend.inference_core.reapply.data_structures.types import BrushAction


class BrushInteraction(BaseInteraction):
    def __init__(self, type, plot, brush, action, **kwargs):
        super().__init__(type)
        self.plot = plot
        if not isinstance(brush, str):
            self.brush: Brush = Brush(**brush)

        if isinstance(brush, str):
            self.brush_id = brush
        else:
            self.brush_id = self.brush.id

        self.action: BrushAction = BrushAction(action)
