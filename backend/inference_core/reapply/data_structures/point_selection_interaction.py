from backend.inference_core.reapply.data_structures.base_interaction import (
    BaseInteraction,
)


class PointSelectionInteraction(BaseInteraction):
    def __init__(self, type, selected, plot, **kwargs):
        super().__init__(type)
        self.selected = selected
        self.plot = plot
