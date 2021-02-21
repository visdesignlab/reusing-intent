import pandas as pd

from backend.inference_core.prediction import Prediction
from backend.inference_core.reapply.data_structures.base_interaction import (
    BaseInteraction,
)
from backend.inference_core.reapply.data_structures.types import InteractionType
from backend.inference_core.reapply.reapply_algorithms.algorithm_picker import (
    apply_prediction,
)


class SelectPredictionInteraction(BaseInteraction):
    def __init__(self, id, type, prediction, **kwargs):
        super().__init__(id, type)
        self.prediction: Prediction = Prediction(**prediction)
        self.dependencies = [
            InteractionType.ADD_PLOT,
            InteractionType.POINT_SELECTION,
            InteractionType.BRUSH,
            InteractionType.SELECT_PREDICTION,
        ]

    def apply(self, base: pd.DataFrame, updated: pd.DataFrame):
        results = self.apply_parent(base, updated)

        changes = apply_prediction(base, updated, self.prediction)

        results.add_change_record(self.id, changes)

        results.update_selections(self.prediction.hash, changes.result, True)

        return results
