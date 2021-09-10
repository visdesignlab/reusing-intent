import numpy as np
from sklearn.cluster import DBSCAN

from ..scalers.robust import fit_transform


def dbscan_params(rows: int):
    epss = [0.1, 0.2, 0.5, 0.7, 1]

    min_samples = []

    for m in range(0, rows + 1, 5):
        if m == 0:
            continue
        if m <= 20:
            min_samples.append(m)
        elif m <= 50 and m % 10 == 0:
            min_samples.append(m)
        elif m <= 500 and m % 100 == 0:
            min_samples.append(m)

    return epss, min_samples


def dbscan(data: np.ndarray, eps, min_samples) -> DBSCAN:
    scaled_data = fit_transform(data)

    clf = DBSCAN(eps=eps, min_samples=min_samples)
    clf.fit(scaled_data)

    return clf
