import numpy as np
from sklearn.cluster import DBSCAN

from ..scalers.robust import fit_transform


def dbscan(data: np.ndarray, eps, min_samples) -> DBSCAN:
    scaled_data = fit_transform(data)

    clf = DBSCAN(eps=eps, min_samples=min_samples)
    clf.fit(scaled_data)

    return clf
