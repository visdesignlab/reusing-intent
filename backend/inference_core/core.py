import pandas as pd

from backend.inference_core.algorithms.dbscan import DBScanCluster


def hello() -> str:
    return "Hello, World 2!"


def process_dataset(data: pd.DataFrame):
    DBScanCluster(data, 0.5, 5)
