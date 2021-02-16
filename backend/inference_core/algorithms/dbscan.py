import json

import pandas as pd
from sklearn.cluster import DBSCAN

from backend.inference_core.utils import robustScaler
from backend.server.database.schemas.algorithms.cluster import DBScanCluster
from backend.server.database.schemas.algorithms.outlier import DBScanOutlier

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


def get_dbscan_count(data: pd.DataFrame):
    eps, min_samples = get_params(data.shape[0])
    params = [(e, m) for e in eps for m in min_samples]
    return len(params)


def dbscan(data, eps, min_samples):
    clf = DBSCAN(eps=eps, min_samples=min_samples)
    clf.fit(data)
    labels = clf.labels_
    params = {"eps": eps, "min_samples": min_samples}

    return labels, params


def computeDBScan(data: pd.DataFrame, dimensions, record_id, outlier=False):
    eps, min_samples = get_params(data.shape[0])
    params = [(e, m) for e in eps for m in min_samples]

    scaled_data = robustScaler(data.values)

    results = [dbscan(scaled_data, eps=e, min_samples=m) for e, m in params]

    rets = [
        (",".join(map(str, labels)), json.dumps({"params": params}))
        for labels, params in results
    ]

    if outlier:
        return [
            DBScanOutlier(
                dimensions=dimensions, output=output, info=params, record_id=record_id
            )
            for output, params in rets
        ]
    else:
        return [
            DBScanCluster(
                dimensions=dimensions, output=output, info=params, record_id=record_id
            )
            for output, params in rets
        ]
