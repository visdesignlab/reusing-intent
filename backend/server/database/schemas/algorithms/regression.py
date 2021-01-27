from typing import List

import numpy as np
import pandas as pd

from backend.inference_core.intent_contract import Prediction
from backend.inference_core.rankings import rank_jaccard
from backend.server.database.schemas.algorithms.intent_base import IntentBase

from ..base import Base


class RegressionBase(IntentBase):
    def processOutput(self):
        output = list(map(int, self.output.split(",")))
        arr = np.ndarray(shape=(len(output), 2))

        arr[:, 0] = [1 if x == 1 else 0 for x in output]
        arr[:, 1] = [1 if x == 0 else 0 for x in output]

        df = pd.DataFrame(arr, columns=["LR:within", "LR:outside"])

        return df

    def predict(self, selection: List[int], ids):
        output = self.processOutput()
        sels = np.array(selection)

        preds: List[Prediction] = [
            Prediction(
                rank=rank_jaccard(vals.values, sels),
                intent=str(col),
                memberIds=self.getMemberIds(vals.values, ids),
                dimensions=self.getDimensionArr(),
                params=self.getParams(),
                algorithm=self.algorithm,
            )
            for col, vals in output.iteritems()
        ]

        return preds


class LinearRegression(Base, RegressionBase):
    __tablename__ = "LinearRegression"

    @property
    def intentType(self) -> str:
        return "Linear Regression"

    @property
    def algorithm(self) -> str:
        return "LR"

    @property
    def description(self) -> str:
        return f"{self.intentType}:{self.algorithm}"


class QuadraticRegression(Base, RegressionBase):
    __tablename__ = "QuadraticRegression"

    @property
    def intentType(self) -> str:
        return "Quadratic Regression"

    @property
    def algorithm(self) -> str:
        return "QR"

    @property
    def description(self) -> str:
        return f"{self.intentType}:{self.algorithm}"
