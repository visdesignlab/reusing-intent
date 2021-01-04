import itertools
from typing import List

import pandas as pd

from backend.inference_core.algorithms.dbscan import computeDBScan
from backend.inference_core.algorithms.kmeans import computeKMeansClusters
from backend.inference_core.algorithms.linear_regression import computeLR
from backend.server.database.schemas.algorithms.cluster import (
    DBScanCluster,
    KMeansCluster,
)
from backend.server.database.schemas.algorithms.outlier import DBScanOutlier
from backend.server.database.schemas.dataset import DatasetMetadata
from backend.server.database.session import (
    dropAllTables,
    getDBSession,
    getEngine,
    initializeDatabase,
)

chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"


def process_dataset(data, filename, columnsData, label):
    # TODO: Handle missing at some point
    data = data.dropna()

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
    # precompute(data, filename)
    print("Done")


def precompute(data: pd.DataFrame, id: str):
    combinations = getCombinations(data)

    for combo in combinations:
        subset = data[combo]
        dimensions = ",".join(combo)
        precomputeOutliers(subset, dimensions, id)
        precomputeClusters(subset, dimensions, id)
        # precomputeLR(subset, dimensions, id)


def precomputeLR(data: pd.DataFrame, dimensions: str, id: str):
    computeLR(data)
    # session = getDBSession(id)
    # try:
    #     for output, params in computeDBScan(data):
    #         dbscan_cluster_result = DBScanOutlier(
    #             dimensions=dimensions, output=output, params=params
    #         )
    #         session.add(dbscan_cluster_result)
    #     session.commit()
    # except Exception as ex:
    #     raise ex
    # finally:
    #     session.close()


def precomputeOutliers(data: pd.DataFrame, dimensions: str, id: str):
    session = getDBSession(id)
    try:
        for output, params in computeDBScan(data):
            dbscan_cluster_result = DBScanOutlier(
                dimensions=dimensions, output=output, params=params
            )
            session.add(dbscan_cluster_result)
        session.commit()
    except Exception as ex:
        raise ex
    finally:
        session.close()


def precomputeClusters(data: pd.DataFrame, dimensions: str, id: str):
    session = getDBSession(id)
    try:
        for output, params in computeDBScan(data):
            dbscan_cluster_result = DBScanCluster(
                dimensions=dimensions, output=output, params=params
            )
            session.add(dbscan_cluster_result)
        for output, params in computeKMeansClusters(data):
            kmeans_result = KMeansCluster(
                dimensions=dimensions, output=output, params=params
            )
            session.add(kmeans_result)
        session.commit()
    except Exception as ex:
        raise ex
    finally:
        session.close()


def getCombinations(
    data: pd.DataFrame, lower_limit=1, upper_limit=-1
) -> List[List[str]]:
    """Generates all combinations of numeric column names

    Parameters
    ----------

    data : pd.DataFrame
        The complete dataset.

    lower_limit : int, optional
        Lower limit of combinations, by default 1.

    upper_limit : int, optional
        Upper limit of combinations, -1 is all columns, by default -1.

    Returns
    -------
    List[List[str]]
        List of column combinations
    """

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
    """Gets metadata for given dataframe

    Parameters
    ----------
    data : pd.DataFrame
        The dataset

    columnsData : [type], optional
        This is the extra data supplied during upload, by default None

    label : [type], optional
        label column supplied during upload, by default None

    Returns
    -------
    Metadata
    """
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
        for col, val in columnsData["columns"].items():
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
