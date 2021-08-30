from typing import Any, List

import numpy as np
import pandas as pd
from reapply_workflows.compute.dbscan import dbscan
from reapply_workflows.compute.isolationforest_outlier import isolationforest_outlier
from reapply_workflows.compute.kmeans_cluster import kmeans_cluster
from reapply_workflows.compute.pareto import pareto
from reapply_workflows.compute.regression import regression

from .algorithms.base import AlgorithmBase


class Intent:
    def __init__(
        self,
        intent: str,
        algorithm: str,
        dimensions: str,
        params: Any,
        info: Any,
        output: str = "",
        **kwargs
    ):
        self.intent = intent
        self.algorithm = algorithm
        self.output = list(map(int, output.split(","))) if len(output) > 0 else []
        self.dimensions = (
            dimensions.split(",") if isinstance(dimensions, str) else dimensions
        )
        self.params = params
        self.info = info

    @staticmethod
    def from_algorithm(alg: AlgorithmBase):
        return Intent(**alg.to_dict())

    @staticmethod
    def from_intent(intent):
        i = Intent(**intent)
        return i

    def apply(self, data: pd.DataFrame):
        ids: List[str] = []

        subset = data[self.dimensions]

        if self.intent == "Cluster":
            if self.algorithm == "KMeans":
                clf = kmeans_cluster(
                    subset.values,
                    self.params["n_clusters"],
                    np.array(self.info["centers"]),
                )
                closest_center = self.info["selected_center"]
                centers = clf.cluster_centers_
                distances = np.linalg.norm(centers - closest_center, axis=1)
                center_id = np.argmin(distances)
                ids = data[clf.labels_ == center_id].id.tolist()
            elif self.algorithm == "DBScan":
                clf = dbscan(
                    subset.values, self.params["eps"], self.params["min_samples"]
                )
                subset["labels"] = clf.labels_
                print(np.unique(clf.labels_))
                subset["id"] = data.id
                org_pts = set(self.info["members"])
                groups = subset.groupby("labels")
                distances = {}
                for name, group in groups:
                    grp = set(group.id.tolist())
                    distance = float(len(list(org_pts.intersection(grp)))) / float(
                        len(list(org_pts.union(grp)))
                    )
                    distances[name] = 1 - distance

                matched_group = min(distances, key=distances.get)
                ids = subset[subset.labels == matched_group].id.tolist()
        elif self.intent == "Outlier":
            if self.algorithm == "DBScan":
                clf = dbscan(
                    subset.values, self.params["eps"], self.params["min_samples"]
                )
                ids = data[clf.labels_ == -1].id.tolist()
            elif self.algorithm == "Isolation Forest":
                _, labels = isolationforest_outlier(
                    subset.values, self.params["contamination"]
                )
                subset["id"] = data.id
                subset["labels"] = labels
                ids = subset[subset.labels == -1].id.tolist()
        elif self.intent == "Multivariate Optimization":
            mask = pareto(subset.values, self.params["sense"])
            mask = list(map(lambda x: x == 1, mask))
            ids = data[mask].id.tolist()
        elif "Regression" in self.intent:
            output = regression(
                subset.values, 100, self.params["order"], self.params["multiplier"]
            )

            in_mask = output[1]
            mask = in_mask == 1

            is_inside = self.info["type"] != "Outside"
            if not is_inside:
                mask = np.logical_not(in_mask)

            ids = data[mask].id.tolist()

        return ids
