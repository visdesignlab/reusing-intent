import itertools
import json
from typing import List

import pandas as pd
import yaml

from backend.server.celery.tasks import (
    precomputeClusters,
    precomputeLR,
    precomputeOutliers,
    precomputeSkyline,
)
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

    if sourceMetadata:
        sourceMetadata = yaml.full_load(sourceMetadata)
    labelColumn = sourceMetadata["label_column"]

    dataset_df = dataset_df[sorted_cols]  # type: ignore
    dataset_df.set_index(
        dataset_df.apply(lambda row: getUIDForString(str(row[labelColumn])), axis=1),
        inplace=True,
        verify_integrity=True,
    )
    dataset_df.reset_index(level=0, inplace=True)
    dataset_df.rename(columns={"index": "id"}, inplace=True)
    dataset_df["id"] = dataset_df["id"].astype(str)  # type: ignore

    dataset_df.set_index(
        dataset_df.apply(
            lambda row: getUIDForString("_".join(row.values.astype(str))), axis=1
        ),
        inplace=True,
        verify_integrity=True,
    )
    dataset_df.reset_index(level=0, inplace=True)
    dataset_df.rename(columns={"index": "iid"}, inplace=True)
    dataset_df["iid"] = dataset_df["iid"].astype(str)  # type: ignore

    metadata, dataset_df = getMetadata(dataset_df, sourceMetadata)

    engine = getEngine(project)

    dataset_record_id = None

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

            dataset_df["record_id"] = str(dataset_record_id)

            uploadMetadata(dataset_df, metadata, session, dataset_record_id)
            uploadDataset(dataset_df, "Dataset", conn)

    dimensions = list(dataset_df.select_dtypes("number").columns)
    combinations = getCombinations(dimensions)[0:10]

    task_trackers = precompute(dataset_df, combinations, project, dataset_record_id)
    return task_trackers


def precompute(data, combinations, project, record_id):
    outlier_task = precomputeOutliers.delay(
        data.to_json(), combinations, record_id, project
    )
    cluster_task = precomputeClusters.delay(
        data.to_json(), combinations, record_id, project
    )
    linear_regression_task = precomputeLR.delay(
        data.to_json(), combinations, record_id, project
    )
    skyline_task = precomputeSkyline.delay(
        data.to_json(), combinations, record_id, project
    )

    return [
        {"type": "Outlier", "id": outlier_task.task_id},
        {"type": "Cluster", "id": cluster_task.task_id},
        {"type": "Linear Regression", "id": linear_regression_task.task_id},
        {"type": "Skyline", "id": skyline_task.task_id},
    ]


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
            data[column] = data[column].astype(str)
        if column == "id":
            dataType = "id"
        if column == "iid":
            dataType = "iid"
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

    return metadata, data


def uploadDataset(data, tableName: str, session):
    data.to_sql(tableName, con=session, if_exists="append", index=False)


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


def getCombinations(
    dimensions: List[str],
    lower_limit=1,
    upper_limit=-1,
) -> List[List[str]]:
    """Generates all combinations of numeric column names

    Parameters
    ----------

    dimensions : List[str]
        dimensions to create combinations from

    lower_limit : int, optional
        Lower limit of combinations, by default 1.

    upper_limit : int, optional
        Upper limit of combinations, -1 is all columns, by default -1.

    Returns
    -------
    List[List[str]]
        List of column combinations
    """

    combinations = []
    ul = upper_limit
    if ul == -1:
        ul = len(dimensions) + 1

    for length in range(lower_limit, ul):
        subset = list(itertools.combinations(dimensions, length))
        combinations.extend(subset)
    combinations = [sorted(list(s)) for s in combinations]

    return combinations
