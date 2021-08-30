import itertools
from typing import List

import pandas as pd
import yaml

from ..celery.tasks import (
    precompute_dbscan_clusters,
    precompute_dbscan_outliers,
    precompute_isolationforest_outliers,
    precompute_kmeans_clusters,
    precompute_linear_regression,
    precompute_polynomial_regression,
    precompute_skylines,
)
from ..db import db
from ..db.models.dataset_meta import DatasetMeta
from ..db.models.dataset_record import DatasetRecord
from ..db.models.project import Project
from .add_ids import add_ids
from .hash import get_hash_for_dataset

chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"


def process(project: str, version: str, dataset, source_metadata=None):
    p = Project.query.filter_by(name=project).first()
    if p is None:
        raise Exception(f"Project {project} not found")
    record = (
        DatasetRecord.query.filter_by(project_id=p.id).filter_by(version=version).all()
    )

    if len(record) > 0 and record[0].version == "1":
        raise Exception("This dataset already exists")
    elif len(record) > 0:
        db.session.delete(record[0])
        db.session.commit()

    data: pd.DataFrame = pd.read_csv(dataset)  # type: ignore

    # data.dropna(inplace=True)

    sorted_columns = sorted(data.columns)
    data = data[sorted_columns]

    if source_metadata:
        source_metadata = yaml.full_load(source_metadata)

    isLabelInSource = source_metadata and "label_column" in source_metadata

    if not isLabelInSource:
        data = add_label_column(data)

    label_column = source_metadata["label_column"] if isLabelInSource else "gen_label"

    data = add_ids(data, label_column)

    metadata, data = get_metadata(data, label_column, source_metadata)

    dataset_hash = get_hash_for_dataset(data)

    data_binary = data.to_parquet()  # type: ignore
    rec = DatasetRecord(
        version=version,
        project_id=p.id,
        hash=dataset_hash,
        data=data_binary,
    )
    db.session.add(rec)

    for key, value in metadata.items():
        check = DatasetMeta.query.filter_by(project_id=p.id).filter_by(key=key).all()

        if len(check) > 0:
            continue

        meta = DatasetMeta(project_id=p.id, key=key, **value)
        db.session.add(meta)

    db.session.commit()

    return "Done!"

    # dimensions = list(data.select_dtypes("number").columns)

    # combinations = getCombinations(dimensions, upper_limit=3)

    # data_json = data.to_json()

    # dbscan_outlier_tracker = precompute_dbscan_outliers.delay(
    #     data_json, combinations, rec.id
    # )
    # isolationforest_outlier_tracker = precompute_isolationforest_outliers.delay(
    #     data_json, combinations, rec.id
    # )
    # kmeans_cluster_tracker = precompute_kmeans_clusters.delay(
    #     data_json, combinations, rec.id
    # )
    # dbscan_cluster_tracker = precompute_dbscan_clusters.delay(
    #     data_json, combinations, rec.id
    # )
    # skyline_tracker = precompute_skylines.delay(data_json, combinations, rec.id)
    # linear_tracker = precompute_linear_regression.delay(data_json, combinations, rec.id)
    # polynomial_tracker = precompute_polynomial_regression.delay(
    #     data_json, combinations, rec.id
    # )

    # return {
    #     "trackers": {
    #         "dbscan-outlier": dbscan_outlier_tracker.task_id,
    #         "isolationforest-outlier": isolationforest_outlier_tracker.task_id,
    #         "kmeans-cluster": kmeans_cluster_tracker.task_id,
    #         "dbscan-cluster": dbscan_cluster_tracker.task_id,
    #         "skyline": skyline_tracker.task_id,
    #         "linear": linear_tracker.task_id,
    #         "poly": polynomial_tracker.task_id,
    #     }
    # }


def add_label_column(data: pd.DataFrame) -> pd.DataFrame:
    new_data = data.reset_index(level=0)
    new_data.rename(columns={"index": "gen_label"}, inplace=True)
    new_data["gen_label"] = new_data["gen_label"].map(lambda x: f"P_{x}")

    return new_data


def get_metadata(data: pd.DataFrame, label: str, source_metadata=None):
    metadata = {}

    for count, (column, values) in enumerate(data.iteritems()):
        options = None
        data_type = values.dtype
        if column == label:
            data_type = "label"
            data[column] = data[column].astype(str)
        elif column == "id" or column == "iid":
            data_type = column
        elif data_type == "object":
            data_type = "categorical"
            options = list(set(values.tolist()))
        elif "int" in str(data_type) or "float" in str(data_type):
            data_type = "numeric"

        desc = {
            "fullname": column,
            "unit": None,
            "short": chars[count],
            "data_type": data_type,
            "options": ",".join(map(str, options)) if options else options,
        }

        metadata[column] = desc

    if source_metadata and "columns" in source_metadata:
        for col, val in source_metadata["columns"].items():
            for k, v in val.items():
                metadata[col][k] = v

    return metadata, data


def getCombinations(dimensions: List[str], lower_limit=1, upper_limit=-1):
    combinations = []
    ul = upper_limit if upper_limit > 1 else len(dimensions) + 1

    for length in range(lower_limit, ul + 1):
        subset = list(itertools.combinations(dimensions, length))
        combinations.extend(subset)
    combinations = [sorted(list(s)) for s in combinations]

    return combinations
