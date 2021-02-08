from typing import List

import numpy as np

from backend.inference_core.intent_contract import Prediction
from backend.inference_core.prediction_stats import getStats
from backend.inference_core.rankings import rank_jaccard
from backend.server.database.schemas.algorithms.intent_base import IntentBase
from backend.server.database.schemas.base import Base


class Skyline(Base, IntentBase):
    __tablename__ = "Skyline"

    @property
    def intentType(self):
        return "Skyline"

    @property
    def algorithm(self):
        return "BNL"

    @property
    def description(self):
        return f"{self.intentType}-{self.algorithm}"

    def processOutput(self):
        output = list(map(int, self.output.split(",")))
        return np.array(output)

    def predict(self, selection: List[int], ids):
        output = self.processOutput()
        sels = np.array(selection)

        preds: List[Prediction] = [
            Prediction(
                rank=rank_jaccard(output, sels),
                intent=self.intentType,
                memberIds=self.getMemberIds(output, ids),
                dimensions=self.getDimensionArr(),
                info=self.getInfo(),
                algorithm=self.algorithm,
                membership=getStats(
                    self.getMemberIds(output, ids),
                    ids[sels.astype(bool)].tolist(),
                ),
            )
        ]

        return preds
