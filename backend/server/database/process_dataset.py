import itertools
import json
from typing import List

import pandas as pd
import yaml

from backend.inference_core.algorithms.dbscan import computeDBScan
from backend.inference_core.algorithms.kmeans import computeKMeansClusters
from backend.server.database.schemas.algorithms.cluster import (
    DBScanCluster,
    KMeansCluster,
)
from backend.server.database.schemas.algorithms.outlier import DBScanOutlier
from backend.server.database.schemas.datasetMetadata import DatasetMetadata
from backend.server.database.schemas.datasetRecord import DatasetRecord
from backend.server.database.session import getEngine, getSessionScopeFromEngine
from backend.utils.hash import getUIDForString

chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"


def process_dataset(
    project, dataset, dataset_hash, version, description, sourceMetadata
):
    dataset_df: pd.DataFrame = pd.read_csv(dataset)  # type: ignore
    dataset_df.dropna(inplace=True)

    sorted_cols = sorted(dataset_df.columns)

    dataset_df = dataset_df[sorted_cols]  # type: ignore
    dataset_df.set_index(
        dataset_df.apply(
            lambda row: getUIDForString("_".join(row.values.astype(str))), axis=1
        ),
        inplace=True,
        verify_integrity=True,
    )
    dataset_df.reset_index(level=0, inplace=True)
    dataset_df.rename(columns={"index": "id"}, inplace=True)
    dataset_df["id"] = dataset_df["id"].astype(str)  # type: ignore

    if sourceMetadata:
        sourceMetadata = yaml.full_load(sourceMetadata)
    metadata = getMetadata(dataset_df, sourceMetadata)

    engine = getEngine(project)

    with engine.begin() as conn:
        with getSessionScopeFromEngine(conn) as session:
            records = session.query(DatasetRecord).all()

            for rec in records:
                if dataset_hash == rec.key:
                    raise Exception(
                        422,
                        "DATASET_PRESENT",
                        f"This dataset already exists with version: {rec.version}",
                    )

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
            precompute(dataset_df, session)
            session.commit()
            return f"{record.id}"


def precompute(data, session):
    combinations = getCombinations(data)

    for combo in combinations:
        subset = data[combo]
        dimensions = ",".join(combo)
        precomputeOutliers(subset, dimensions, session)
        precomputeClusters(subset, dimensions, session)
        # precomputeLR(subset, dimensions, id)


def precomputeOutliers(data, dimensions: str, session):
    for output, params in computeDBScan(data):
        dbscan_cluster_result = DBScanOutlier(
            dimensions=dimensions, output=output, params=params
        )
        session.add(dbscan_cluster_result)


def precomputeClusters(data: pd.DataFrame, dimensions: str, session):
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
                info = json.dumps(values.value_counts().to_dict())

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
