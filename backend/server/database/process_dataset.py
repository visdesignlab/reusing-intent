import itertools
import json
from typing import List

import pandas as pd
import yaml

from backend.inference_core.algorithms.dbscan import computeDBScan
from backend.inference_core.algorithms.kmeans import computeKMeansClusters
from backend.inference_core.algorithms.linear_regression import computeLR
from backend.server.database.schemas.algorithms.cluster import (
    DBScanCluster,
    KMeansCluster,
)
from backend.server.database.schemas.algorithms.outlier import DBScanOutlier
from backend.server.database.schemas.datasetMetadata import DatasetMetadata
from backend.server.database.schemas.datasetRecord import DatasetRecord
from backend.server.database.session import (
    dropAllTables,
    getDBSession,
    getEngine,
    getSessionScopeFromEngine,
    initializeDatabase,
)

chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"


def process_dataset(
    project, dataset, dataset_hash, version, description, sourceMetadata
):
    dataset_df: pd.DataFrame = pd.read_csv(dataset)  # type: ignore
    dataset_df.dropna(inplace=True)

    dataset_df.set_index(pd.util.hash_pandas_object(dataset_df), inplace=True, verify_integrity=True)  # type: ignore
    dataset_df.reset_index(level=0, inplace=True)
    dataset_df.rename(columns={"index": "id"}, inplace=True)
    dataset_df["id"] = dataset_df["id"].astype(str)  # type: ignore

    if sourceMetadata:
        sourceMetadata = yaml.full_load(sourceMetadata)
    metadata = getMetadata(dataset_df, sourceMetadata)

    engine = getEngine(project)

    with engine.begin() as conn:
        with getSessionScopeFromEngine(conn) as session:
            record = DatasetRecord(
                key=dataset_hash,
                version=version,
                description=description,
                rows=dataset_df.shape[0],
                columns=dataset_df.shape[1],
            )
            session.add(record)
            session.flush()
            dataset_record_id = record.id
            if dataset_record_id is None:
                raise Exception()

            uploadMetadata(dataset_df, metadata, session, dataset_record_id)
            uploadDataset(dataset_df, f"Dataset_{dataset_record_id}", conn)
            session.commit()
            return f"{record.id}"


def process_dataset_(data, filename, columnsData, label):
    # TODO: Handle missing at some point
    data = data.dropna()

    data = data.infer_objects()
    # TODO: Maybe convert datatype of df when not matching according to columnsData
    # metadata = getMetadata(data, columnsData, label)

    # Drop all tables
    dropAllTables(filename)
    # Initialize database
    initializeDatabase(filename)
    # Upload dataset
    # uploadDataset(data, filename)
    # Upload metadata
    # uploadMetadata(metadata, filename)
    # Precompute
    # precompute(data, filename)
    # print("Done")


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


def getMetadata(data, sourceMetadata=None):
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
    label = None

    if sourceMetadata and "label_column" in sourceMetadata:
        label = sourceMetadata["label_column"]

    for count, (column, values) in enumerate(data.iteritems()):
        dataType = values.dtype
        if column == label:
            dataType = "label"
        if column == "id":
            dataType = "id"
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

    if sourceMetadata and "columns" in sourceMetadata:
        for col, val in sourceMetadata["columns"].items():
            for k, v in val.items():
                metadata[col][k] = v

    return metadata


def uploadDataset(data, tableName: str, session):
    data.to_sql(tableName, con=session, if_exists="replace", index=False)


def uploadMetadata(data, metadata, session, record_id):
    try:
        for k, v in metadata.items():
            fullname, unit, short, dataType = v.values()
            info = None
            values = data[k]
            if dataType == "numeric":
                info = values.describe().to_json()
            if dataType == "categorical":
                info = json.dumps({"unique_values": list(values.unique())})

            d = DatasetMetadata(
                record_id=record_id,
                name=k,
                fullname=fullname,
                unit=unit,
                short=short,
                dataType=dataType,
                info=info,
            )
            session.add(d)
    except Exception as e:
        raise e
