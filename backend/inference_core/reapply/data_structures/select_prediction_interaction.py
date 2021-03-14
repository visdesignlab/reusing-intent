from backend.inference_core.prediction import Prediction
from backend.inference_core.reapply.data_structures.base_interaction import (
    BaseInteraction,
)


class SelectPredictionInteraction(BaseInteraction):
    def __init__(self, type, prediction, **kwargs):
        super().__init__(type)
        self.prediction: Prediction = Prediction(**prediction)
