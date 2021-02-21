from typing import List

import numpy as np
import pandas as pd
from scipy.spatial import ConvexHull  # type: ignore

from backend.inference_core.prediction import Prediction
from backend.inference_core.prediction_stats import getStats
from backend.inference_core.rankings import rank_jaccard
from backend.server.database.schemas.algorithms.intent_base import IntentBase

from ..base import Base


class ClusterBase(IntentBase):
    def getClusterParams(self, vals, idx):
        info = self.getInfo()
        info["hull"] = []
        if vals.shape[0] >= 3:
            hull = ConvexHull(vals)
            info["hull"] = vals[hull.vertices, :].tolist()
        if self.algorithm == "DBScan":
            return info
        info["selected_center"] = info["centers"][idx]
        return info

    def processOutput(self):
        output = list(map(int, self.output.split(",")))
        unique_vals = list(filter(lambda x: x >= 0, set(output)))

        arr = np.ndarray(shape=(len(output), len(unique_vals)))
        arr = arr.astype(int)  # type: ignore

        for i, val in enumerate(unique_vals):
            arr[:, i] = [1 if x == val else 0 for x in output]

        df = pd.DataFrame(arr, columns=[f"{self.description}:{i}" for i in unique_vals])

        return df, unique_vals

    def predict(self, selection: List[int], dataset) -> List[Prediction]:
        output, unique_vals = self.processOutput()
        sels = np.array(selection)
        ids = dataset["id"]

        preds: List[Prediction] = [
            Prediction(
                rank=rank_jaccard(vals.values, sels),
                intent=self.intentType,
                memberIds=self.getMemberIds(vals.values, ids),
                dimensions=self.getDimensionArr(),
                info=self.getClusterParams(
                    dataset.loc[
                        vals.values.astype(bool), self.getDimensionArr()
                    ].values,
                    u,
                ),
                algorithm=self.algorithm,
                membership=getStats(
                    self.getMemberIds(vals.values, ids),
                    ids[sels.astype(bool)].tolist(),
                ),
                description=self.description,
            )
            for (_, vals), u in zip(output.iteritems(), unique_vals)
        ]

        return preds


class DBScanCluster(Base, ClusterBase):
    __tablename__ = "DBScanCluster"

    @property
    def intentType(self) -> str:
        return "Cluster"

    @property
    def algorithm(self) -> str:
        return "DBScan"


class KMeansCluster(Base, ClusterBase):
    __tablename__ = "KMeansCluster"

    @property
    def intentType(self) -> str:
        return "Cluster"

    @property
    def algorithm(self) -> str:
        return "KMeans"
