from backend.inference_core.prediction import Prediction
from backend.inference_core.reapply.compare import get_changes_df
from backend.inference_core.reapply.data_structures.apply_results import Changes
from backend.inference_core.reapply.data_structures.types import Algorithms, Intents
from backend.inference_core.reapply.reapply_algorithms.dbscan import (
    applyDBScanCluster,
    applyDBScanOutlier,
)
from backend.inference_core.reapply.reapply_algorithms.kmeans import applyKMeans
from backend.inference_core.reapply.reapply_algorithms.range import apply_range
from backend.inference_core.reapply.reapply_algorithms.skyline import applySkyline


def apply_prediction(base, data, prediction: Prediction):
    info = prediction.info
    changes = {}
    ids = None

    print(prediction.algorithm, prediction.intent)

    algorithm = Algorithms(prediction.algorithm)
    intent = Intents(prediction.intent)

    if algorithm == Algorithms.KMEANS:
        ids, closest_center = applyKMeans(
            data,
            prediction.dimensions,
            info["params"]["n_clusters"],
            info["selected_center"],
        )

        changes = get_changes_df(
            base[base.id.isin(prediction.memberIds)], data[data.id.isin(ids)]
        )
        changes = Changes(**changes.serialize(), **{"center": closest_center})
        return changes
    if algorithm == Algorithms.DBSCAN:
        eps = info["params"]["eps"]
        min_samples = info["params"]["min_samples"]
        if intent == Intents.CLUSTER:
            ids = applyDBScanCluster(
                data,
                prediction.dimensions,
                eps,
                min_samples,
                prediction.memberIds,
            )
        if intent == Intents.OUTLIER or intent == Intents.NONOUTLIER:
            ids = applyDBScanOutlier(
                data,
                prediction.dimensions,
                eps,
                min_samples,
                intent != Intents.NONOUTLIER,
            )
    if algorithm == Algorithms.DECISIONTREE:
        ids = apply_range(data, info["rules"])

    if algorithm == Algorithms.BNL:
        ids = applySkyline(data, prediction.dimensions, info["sense"])

    changes = get_changes_df(
        base[base.id.isin(prediction.memberIds)], data[data.id.isin(ids)]
    )

    return changes
