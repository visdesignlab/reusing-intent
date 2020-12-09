import json

import pandas as pd
from sklearn.cluster import DBSCAN

from backend.inference_core.utils import robustScaler


def computeDBScanCluster(
    data: pd.DataFrame, dimensions, eps: float = 0.5, min_samples: float = 5
):
    dbscan = DBSCAN(eps=eps, min_samples=min_samples)

    df = data.dropna()
    scaled = robustScaler(df.values)
    dbscan.fit(scaled)
    labels = [str(i) for i in list(dbscan.labels_)]

    return {
        "dimensions": ",".join(dimensions),
        "output": ",".join(labels),
        "params": json.dumps(dbscan.get_params()),
    }
