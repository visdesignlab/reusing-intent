import numpy as np
import pandas as pd

from backend.inference_core.algorithms.linear_regression import computeLR
from backend.inference_core.prediction import Prediction


def apply_linear_regression(data: pd.DataFrame, prediction: Prediction, selection):
    lr = computeLR(data[prediction.dimensions], ",".join(prediction.dimensions), "")[0]

    predictions = lr.predict(selection, data)

    if prediction.info["type"] == "within":
        return predictions[0]
    return predictions[1]
