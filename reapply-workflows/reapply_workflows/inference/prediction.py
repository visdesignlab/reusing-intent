import json
from typing import List

import numpy as np
import pandas as pd

from ..utils.jaccard_similarity import jaccard_similarity
from .intent import Intent


# Modify app/src/types/Prediction.ts in conjunction
class Prediction:
    def __init__(self, intent: Intent):
        self.intent = intent.intent
        self.algorithm = intent.algorithm
        self.info = json.loads(intent.info)
        self.dimensions = intent.dimensions
        self.params = json.loads(intent.params)
        self.rank_jaccard = -1
        self.rank_auto_complete = -1
        self.rank_nb = -1
        self.members = []
        self.membership_stats = []

    def to_dict(self):
        return {
            "intent": self.intent,
            "algorithm": self.algorithm,
            "info": self.info,
            "params": self.params,
            "rank_jaccard": self.rank_jaccard,
            "rank_auto_complete": self.rank_auto_complete,
            "rank_nb": self.rank_nb,
            "dimensions": self.dimensions,
            "members": self.members,
            "membership_stats": self.membership_stats,
        }

    @staticmethod
    def from_intent(
        intent: Intent, data: pd.DataFrame, selections: List[str]
    ) -> List["Prediction"]:
        if intent.algorithm == "DBScan":
            if intent.intent == "Outlier":
                mask = np.array(intent.output) == -1
                selected = data[mask].id.tolist()
                pred = Prediction(intent)
                pred.members = selected
                pred.rank_jaccard = jaccard_similarity(pred.members, selections)
                pred.membership_stats = get_stats(pred.members, selections)
                return [pred]
            elif intent.intent == "Cluster":
                preds: List[Prediction] = []
                cluster_vals = np.unique(intent.output)
                for cluster_id in cluster_vals:
                    if cluster_id == -1:
                        continue
                    mask = np.array(intent.output) == cluster_id
                    selected = data[mask].id.tolist()
                    pred = Prediction(intent)
                    pred.members = selected
                    pred.rank_jaccard = jaccard_similarity(pred.members, selections)
                    pred.membership_stats = get_stats(pred.members, selections)
                    preds.append(pred)
                return preds
        elif intent.algorithm == "Isolation Forest":
            mask = np.array(intent.output) == -1
            selected = data[mask].id.tolist()
            pred = Prediction(intent)
            pred.members = selected
            pred.rank_jaccard = jaccard_similarity(pred.members, selections)
            pred.membership_stats = get_stats(pred.members, selections)
            return [pred]
        elif intent.algorithm == "KMeans":
            preds: List[Prediction] = []
            cluster_vals = np.unique(intent.output)
            for cluster_id in cluster_vals:
                if cluster_id == -1:
                    continue
                mask = np.array(intent.output) == cluster_id
                selected = data[mask].id.tolist()
                pred = Prediction(intent)
                pred.members = selected
                pred.rank_jaccard = jaccard_similarity(pred.members, selections)
                pred.membership_stats = get_stats(pred.members, selections)
                preds.append(pred)
            return preds
        elif intent.algorithm == "TheilSenRegressor":
            output = np.array(intent.output)

            inlier_mask = output == 1
            outlier_mask = output == 0

            inliers = data[inlier_mask].id.tolist()

            inlier_pred = Prediction(intent)
            inlier_pred.members = inliers
            inlier_pred.rank_jaccard = jaccard_similarity(inliers, selections)
            inlier_pred.membership_stats = get_stats(inliers, selections)
            inlier_pred.info["type"] = "Within"

            outliers = data[outlier_mask].id.tolist()
            outlier_pred = Prediction(intent)
            outlier_pred.members = outliers
            outlier_pred.rank_jaccard = jaccard_similarity(outliers, selections)
            outlier_pred.membership_stats = get_stats(outliers, selections)
            outlier_pred.info["type"] = "Outside"

            return [inlier_pred, outlier_pred]
        elif intent.algorithm == "Polynomial Features + TheilSenRegressor":
            output = np.array(intent.output)

            inlier_mask = output == 1
            outlier_mask = output == 0

            inliers = data[inlier_mask].id.tolist()

            inlier_pred = Prediction(intent)
            inlier_pred.members = inliers
            inlier_pred.rank_jaccard = jaccard_similarity(inliers, selections)
            inlier_pred.membership_stats = get_stats(inliers, selections)
            inlier_pred.info["type"] = "Within"

            outliers = data[outlier_mask].id.tolist()
            outlier_pred = Prediction(intent)
            outlier_pred.members = outliers
            outlier_pred.rank_jaccard = jaccard_similarity(outliers, selections)
            outlier_pred.membership_stats = get_stats(outliers, selections)
            outlier_pred.info["type"] = "Outside"

            return [inlier_pred, outlier_pred]
        elif intent.algorithm == "BNL":
            mask = np.array(intent.output) == 1
            skyline = data[mask].id.tolist()
            pred = Prediction(intent)
            pred.members = skyline
            pred.rank_jaccard = jaccard_similarity(pred.members, selections)
            pred.membership_stats = get_stats(pred.members, selections)
            return [pred]
        return []


def get_stats(members, sels):
    stats = {
        "ipns": list(set(members) - set(sels)),
        "isnp": list(set(sels) - set(members)),
        "matches": list(set(sels).intersection(set(members))),
    }
    return stats
