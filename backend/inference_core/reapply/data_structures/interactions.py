from typing import Any, Dict, List

import pandas as pd

from backend.inference_core.reapply.data_structures.add_plot_interaction import (
    AddPlotInteraction,
)
from backend.inference_core.reapply.data_structures.base_interaction import (
    BaseInteraction,
)
from backend.inference_core.reapply.data_structures.brush_interaction import (
    BrushInteraction,
)
from backend.inference_core.reapply.data_structures.filter_interaction import (
    FilterInteraction,
)
from backend.inference_core.reapply.data_structures.point_selection_interaction import (
    PointSelectionInteraction,
)
from backend.inference_core.reapply.data_structures.select_prediction_interaction import (
    SelectPredictionInteraction,
)
from backend.inference_core.reapply.data_structures.types import InteractionType


class Interactions(object):
    def __init__(self, interactions):
        self.collection: Dict[str, BaseInteraction] = {}
        self.order: List[str] = []

        for interaction in interactions:
            action = None
            actionType = InteractionType(interaction["type"])

            if actionType == InteractionType.ADD_PLOT:
                action = AddPlotInteraction(**interaction)
            if actionType == InteractionType.BRUSH:
                action = BrushInteraction(**interaction)
            if actionType == InteractionType.SELECT_PREDICTION:
                action = SelectPredictionInteraction(**interaction)
            if actionType == InteractionType.FILTER:
                action = FilterInteraction(**interaction)
            if actionType == InteractionType.POINT_SELECTION:
                action = PointSelectionInteraction(**interaction)

            if action:
                self.order.append(action.id)
                self.collection[action.id] = action

        self.add_parents()
        # self.graph = self.create_graph()

    def get_order(self):
        return self.order

    def to_json(self):
        col = []
        for o in self.order:
            col.append(
                [
                    o,
                    self.collection[o].type.value,
                    self.collection[o].parent.id,
                ]
            )
        return col

    def add_parents(self):
        for idx, id in enumerate(self.order):
            if idx != 0:
                self.collection[id].set_parent(self.collection[self.order[idx - 1]])

    def reapply_interaction(self, base: pd.DataFrame, updated: pd.DataFrame):
        application: Any = self.collection[self.order[-1]].apply(base, updated)

        return application.serialize()
