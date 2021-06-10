import numpy as np
from sklearn.cluster import KMeans

from ..scalers.robust import fit_transform


def kmeans_cluster(data: np.ndarray, n_clusters, init_centers=None):
    scaled_data = fit_transform(data)

    clf = KMeans(
        n_clusters=n_clusters,
        init="k-means++" if init_centers is None else init_centers,
    )

    clf.fit(scaled_data)

    return clf
