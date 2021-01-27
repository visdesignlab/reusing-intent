import json

import pandas as pd
from sklearn.cluster import KMeans

from backend.inference_core.utils import robustScaler2


def get_params():
    return list(range(2, 21))


def get_kmeans_count():
    n_clusters = get_params()
    return len(n_clusters)


def computeKMeansClusters(data: pd.DataFrame):
    n_clusters = get_params()

    scaler = robustScaler2(data.values)
    scaled_data = scaler.transform(data.values)

    kmeansClusterers = [KMeans(n_clusters=n) for n in n_clusters]

    for kmeans in kmeansClusterers:
        kmeans.fit(scaled_data)

    infos = [
        {
            "params": kmeans.get_params(),
            "centers": (
                scaler.inverse_transform(kmeans.cluster_centers_)
            ).tolist(),  # type:ignore
        }
        for kmeans in kmeansClusterers
    ]

    rets = [
        (",".join(map(str, kmeans.labels_)), json.dumps(info))  # type: ignore
        for kmeans, info in zip(kmeansClusterers, infos)
    ]
    return rets
