from backend.inference_core.intent_contract import Prediction
from backend.inference_core.reapply.compare import get_changes_df
from backend.inference_core.reapply.interactions import Algorithms, Intents
from backend.inference_core.reapply.reapply_algorithms.dbscan import (
    applyDBScanCluster,
    applyDBScanOutlier,
)
from backend.inference_core.reapply.reapply_algorithms.kmeans import applyKMeans
from backend.inference_core.reapply.reapply_algorithms.skyline import applySkyline


def apply_prediction(base, data, prediction):
    prediction = Prediction(**prediction)
    info = prediction.info
    changes = {}
    ids = None

    if prediction.algorithm == Algorithms.KMEANS:
        ids, closest_center = applyKMeans(
            data,
            prediction.dimensions,
            info["params"]["n_clusters"],
            info["selected_center"],
        )

        changes = get_changes_df(
            base[base.id.isin(prediction.memberIds)], data[data.id.isin(ids)]
        )
        changes["center"] = closest_center
        return changes
    if prediction.algorithm == Algorithms.DBSCAN:
        if prediction.intent == Intents.CLUSTER:
            ids = applyDBScanCluster(
                data,
                prediction.dimensions,
                info["eps"],
                info["min_samples"],
                prediction.memberIds,
            )
        if prediction.intent == Intents.OUTLIER:
            ids = applyDBScanOutlier(
                data, prediction.dimensions, info["eps"], info["min_samples"]
            )

    if prediction.algorithm == Algorithms.BNL:
        ids = applySkyline(data, prediction.dimensions, info["sense"])

    changes = get_changes_df(
        base[base.id.isin(prediction.memberIds)], data[data.id.isin(ids)]
    )
    return changes
