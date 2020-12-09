import itertools
import os

import pandas as pd
import yaml

from backend.inference_core.algorithms.dbscan import computeDBScanCluster
from backend.server.database.schemas.algorithms.cluster import DBScanCluster
from backend.server.database.schemas.dataset import DatasetMetadata
from backend.server.database.session import (
    dropAllTables,
    getDBSession,
    getEngine,
    initializeDatabase,
)

chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"


def process_dataset(file, columnsData, label):
    filename = os.path.splitext(file.filename)[0]
    data = pd.read_csv(file)
    data = data.infer_objects()
    # TODO: Maybe convert datatype of df when not matching according to columnsData
    metadata = getMetadata(data, columnsData, label)

    # Drop all tables
    dropAllTables(filename)
    # Initialize database
    initializeDatabase(filename)
    # Upload dataset
    uploadDataset(data, filename)
    # Upload metadata
    uploadMetadata(metadata, filename)
    # Precompute
    precompute(data, filename)


def precompute(data: pd.DataFrame, filename):
    combinations = getCombinations(data)
    session = getDBSession(filename)

    for combo in combinations:
        subset = data[combo]
        rets = computeDBScanCluster(subset, combo)
        obj = DBScanCluster(**rets)
        session.add(obj)
    session.commit()

    # precompute_algorithms(data)


def getCombinations(data: pd.DataFrame, lower_limit=1, upper_limit=-1):
    columns = list(data.select_dtypes("number").columns)
    combinations = []
    ul = upper_limit
    if ul == -1:
        ul = len(columns) + 1

    for length in range(lower_limit, ul):
        subset = list(itertools.combinations(columns, length))
        combinations.extend(subset)
    combinations = [sorted(list(s)) for s in combinations]

    return combinations


def getMetadata(data: pd.DataFrame, columnsData=None, label=None):
    metadata = {}

    for count, (column, values) in enumerate(data.iteritems()):
        dataType = values.dtype
        if label == column:
            dataType = "label"
        elif dataType == "object":
            dataType = "categorical"
        elif "int" in str(dataType) or "float" in str(dataType):
            dataType = "numeric"
        desc = {
            "fullname": column,
            "unit": None,
            "short": chars[count],
            "dataType": dataType,
        }
        metadata[column] = desc

    if columnsData:
        cols = yaml.full_load(columnsData)
        for col, val in cols["columns"].items():
            for k, v in val.items():
                metadata[col][k] = v

    return metadata


def uploadDataset(data: pd.DataFrame, filename: str):
    engine = getEngine(filename)
    data.to_sql("Dataset", con=engine, if_exists="replace", index=False)


def uploadMetadata(metadata, filename: str):
    session = getDBSession(filename)
    try:
        for k, v in metadata.items():
            fullname, unit, short, dataType = v.values()
            d = DatasetMetadata(
                name=k, fullname=fullname, unit=unit, short=short, dataType=dataType
            )
            session.add(d)
        session.commit()
    except Exception as e:
        raise e
    finally:
        session.close()
