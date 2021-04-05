import pandas as pd
from scipy.spatial import ConvexHull  # type: ignore

from backend.inference_core.algorithms.dbscan import dbscan as db
from backend.inference_core.reapply.compare import get_similarity
from backend.inference_core.utils import robustScaler2


def applyDBScanCluster(
    data: pd.DataFrame, dimensions, eps, min_samples, original_selections
):
    data = data.copy(deep=True)
    scaler = robustScaler2(data[dimensions].values)
    scaled_data = scaler.transform(data[dimensions].values)

    labels, _ = db(scaled_data, eps, min_samples)
    data["label"] = labels
    groups = data.groupby("label")
    dist = groups.apply(lambda x: get_similarity(x["id"].tolist(), original_selections))
    best_match_label = dist.idxmax()

    ids = groups.get_group(best_match_label).id

    vals = data[data.id.isin(ids)][dimensions].values

    hull = vals
    if vals.shape[0] >= 3:
        hull = ConvexHull(vals)
        hull = vals[hull.vertices, :].tolist()

    return ids, hull


def applyDBScanOutlier(
    data: pd.DataFrame, dimensions, eps, min_samples, intentOutlier=True
):
    data = data.copy(deep=True)
    scaler = robustScaler2(data[dimensions].values)
    scaled_data = scaler.transform(data[dimensions].values)

    labels, _ = db(scaled_data, eps, min_samples)
    data["label"] = labels
    groups = data.groupby("label")

    outliers = groups.get_group(-1).id.tolist()

    if intentOutlier:
        return outliers

    return data[~data.id.isin(outliers)].id.tolist()
