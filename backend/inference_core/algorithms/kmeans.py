import json

import pandas as pd
from sklearn.cluster import KMeans

from backend.inference_core.utils import robustScaler


def get_params():
    return list(range(2, 21))


def get_kmeans_count():
    n_clusters = get_params()
    return len(n_clusters)


def computeKMeansClusters(data: pd.DataFrame):
    n_clusters = get_params()

    scaled_data = robustScaler(data.values)

    kmeansClusterers = [KMeans(n_clusters=n) for n in n_clusters]

    for kmeans in kmeansClusterers:
        kmeans.fit(scaled_data)

    rets = [
        (",".join(map(str, kmeans.labels_)), json.dumps(kmeans.get_params()))  # type: ignore
        for kmeans in kmeansClusterers
    ]
    return rets
