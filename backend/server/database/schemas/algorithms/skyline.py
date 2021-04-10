from typing import List

import numpy as np
import pandas as pd

from backend.inference_core.prediction import Prediction
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

    def processOutput(self):
        output = list(map(int, self.output.split(",")))
        return np.array(output)

    def getSkylineInfo(self, data: pd.DataFrame, ids: List[str], dims):
        selected_points = data.loc[data.id.isin(ids), self.getDimensionArr()]  # type: ignore

        if len(dims) == selected_points.shape[1]:
            selected_points = selected_points[dims]
        info = self.getInfo()

        info["frontier"] = selected_points.values.tolist()
        return info

    def predict(self, selection: List[int], dataset, orig_dims=[]):
        output = self.processOutput()
        sels = np.array(selection)
        ids = dataset["id"]

        preds: List[Prediction] = [
            Prediction(
                rank=rank_jaccard(output, sels),
                intent=self.intentType,
                memberIds=self.getMemberIds(output, ids),
                dimensions=self.getDimensionArr(),
                info=self.getSkylineInfo(
                    dataset, self.getMemberIds(output, ids), orig_dims
                ),
                algorithm=self.algorithm,
                membership=getStats(
                    self.getMemberIds(output, ids),
                    ids[sels.astype(bool)].tolist(),
                ),
                description=self.description,
            )
        ]

        return preds
