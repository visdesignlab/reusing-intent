from typing import List

import numpy as np
import pandas as pd

from backend.inference_core.prediction import Prediction
from backend.inference_core.prediction_stats import getStats
from backend.inference_core.rankings import rank_jaccard
from backend.server.database.schemas.algorithms.intent_base import IntentBase

from ..base import Base


class OutlierBase(IntentBase):
    def processOutput(self):
        output = list(map(int, self.output.split(",")))

        arr = np.ndarray(shape=(len(output), 2))

        arr[:, 0] = [1 if x == -1 else 0 for x in output]
        arr[:, 1] = [1 if x != -1 else 0 for x in output]

        df = pd.DataFrame(arr, columns=["Outlier", "NonOutlier"])
        return df

    def predict(self, selection: List[int], dataset) -> List[Prediction]:
        output = self.processOutput()
        sels = np.array(selection)
        ids = dataset["id"]

        preds: List[Prediction] = [
            Prediction(
                rank=rank_jaccard(vals.values, sels),
                intent=str(col),
                memberIds=self.getMemberIds(vals.values, ids),
                dimensions=self.getDimensionArr(),
                info=self.getInfo(),
                algorithm=self.algorithm,
                membership=getStats(
                    self.getMemberIds(vals.values, ids),
                    ids[sels.astype(bool)].tolist(),
                ),
                description=self.description,
            )
            for col, vals in output.iteritems()
        ]

        return preds


class DBScanOutlier(Base, OutlierBase):
    __tablename__ = "DBScanOutlier"

    @property
    def intentType(self) -> str:
        return "Outlier"

    @property
    def algorithm(self) -> str:
        return "DBScan"
