from backend.inference_core.reapply.data_structures.base_interaction import (
    BaseInteraction,
)
from backend.inference_core.reapply.data_structures.plot import Plot


class AddPlotInteraction(BaseInteraction):
    def __init__(self, type, plot, **kwargs):
        super().__init__(type)
        self.plot: Plot = Plot(**plot)


class RemovePlotInteraction(BaseInteraction):
    def __init__(self, type, plot, **kwargs):
        super().__init__(type)
        self.plotId: str = plot
