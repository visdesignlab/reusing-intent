import json

import pandas as pd
from sklearn.cluster import DBSCAN

from backend.inference_core.utils import robustScaler

# TODO: Implement some sort of Knee detection to add values for eps
# https://towardsdatascience.com/how-to-use-dbscan-effectively-ed212c02e62


def get_params(size: int = 10):
    eps = [0.1, 0.2, 0.5, 0.7, 1]
    min_samples = []

    for m in range(0, size + 1, 5):
        if m == 0:
            continue
        if m <= 20:
            min_samples.append(m)
        elif m <= 50 and m % 10 == 0:
            min_samples.append(m)
        elif m <= 500 and m % 100 == 0:
            min_samples.append(m)

    return eps, min_samples


def computeDBScan(data: pd.DataFrame):
    eps, min_samples = get_params(data.shape[0])
    params = [(e, m) for e in eps for m in min_samples]

    scaled_data = robustScaler(data.values)
    dbscanners = [DBSCAN(eps=e, min_samples=m) for e, m in params]

    for dbscan in dbscanners:
        dbscan.fit(scaled_data)

    rets = [
        (",".join(map(str, dbscan.labels_)), json.dumps(dbscan.get_params()))
        for dbscan in dbscanners
    ]

    return rets
