import json

import pandas as pd
from sklearn.cluster import KMeans

from backend.inference_core.utils import robustScaler2
from backend.server.database.schemas.algorithms.cluster import KMeansCluster


def get_params():
    return list(range(2, 21))


def get_kmeans_count():
    n_clusters = get_params()
    return len(n_clusters)


def kmeans(data, n_clusters):
    clf = KMeans(n_clusters=n_clusters)
    clf.fit(data)
    labels = clf.labels_
    centers = clf.cluster_centers_
    return labels, centers, n_clusters


def computeKMeansClusters(data: pd.DataFrame, dimensions, record_id):
    n_clusters = get_params()

    scaler = robustScaler2(data.values)
    scaled_data = scaler.transform(data.values)

    results = [kmeans(scaled_data, n) for n in n_clusters]

    infos = [
        {
            "params": {"n_clusters": n_cluster},
            "centers": (scaler.inverse_transform(centers)).tolist(),  # type:ignore
        }
        for _, centers, n_cluster in results
    ]

    rets = [
        (",".join(map(str, labels)), json.dumps(info))  # type: ignore
        for (labels, _c, _n), info in zip(results, infos)
    ]

    return [
        KMeansCluster(
            dimensions=dimensions,
            output=output,
            info=params,
            record_id=record_id,
        )
        for output, params in rets
    ]
