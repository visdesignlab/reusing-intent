from backend.inference_core.reapply.data_structures.base_interaction import (
    GenericInteraction,
)
from backend.inference_core.reapply.data_structures.brush_interaction import (
    BrushInteraction,
)
from backend.inference_core.reapply.data_structures.filter_interaction import (
    FilterInteraction,
)
from backend.inference_core.reapply.data_structures.plot_interaction import (
    AddPlotInteraction,
)
from backend.inference_core.reapply.data_structures.point_selection_interaction import (
    PointSelectionInteraction,
)
from backend.inference_core.reapply.data_structures.select_prediction_interaction import (
    SelectPredictionInteraction,
)


class State(object):
    def __init__(self, interaction):
        self._interaction = interaction
        self.interaction = GenericInteraction(interaction)

    @property
    def add_plot_interaction(self):
        return AddPlotInteraction(**self._interaction)

    @property
    def point_selection_interaction(self):
        return PointSelectionInteraction(**self._interaction)

    @property
    def brush_interaction(self):
        return BrushInteraction(**self._interaction)

    @property
    def select_prediction_interaction(self):
        return SelectPredictionInteraction(**self._interaction)

    @property
    def filter_interaction(self):
        return FilterInteraction(**self._interaction)
