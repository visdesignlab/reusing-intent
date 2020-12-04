import pandas as pd
from sklearn.cluster import DBSCAN
from sklearn.preprocessing import MinMaxScaler


def DBScanCluster(data: pd.DataFrame, eps: float, min_samples: float):
    dbscan = DBSCAN(eps=eps, min_samples=min_samples)

    df = data.dropna()
    min_max_scaler = MinMaxScaler()
    scaled = min_max_scaler.fit_transform(df.values)
    dbscan.fit(scaled)
    print(dbscan.labels_)
