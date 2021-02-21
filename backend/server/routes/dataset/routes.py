from typing import Any, Dict, List

import pandas as pd
from flask import Blueprint, jsonify, request

from backend.inference_core.prediction import Prediction
from backend.server.celery.init import celery
from backend.server.database.process_dataset import process_dataset
from backend.server.database.schemas.datasetMetadata import DatasetMetadata
from backend.server.database.schemas.datasetRecord import DatasetRecord
from backend.server.database.session import (
    getEngine,
    getSessionScopeFromEngine,
    getSessionScopeFromId,
)
from backend.server.routes.dataset.predict_helpers import (
    process_filtered,
    process_regular,
)
from backend.server.routes.utils import handle_exception
from backend.utils.hash import getUIDForFile

datasetRoute = Blueprint("dataset", __name__)


def filter_dict(keys: List[str], old_obj: Dict[str, Any]) -> Dict[str, Any]:
    return {key: old_obj[key] for key in keys}


@datasetRoute.route("/<project>/dataset/", methods=["GET"])
def getAllDatasets(project: str) -> Any:
    with getSessionScopeFromId(project) as session:
        records = session.query(DatasetRecord).all()
        records = list(map(lambda x: x.toJSON(), records))

        return jsonify(records)


@datasetRoute.route("/<project>/dataset/", methods=["POST"])
def uploadDataset(project: str):
    if "dataset" not in request.files:
        return handle_exception(Exception(400, "MISSING_FILE", "No file uploaded"))

    version = request.form["version"]
    description = request.form["description"]
    dataset = request.files["dataset"]
    sourceMetadata = None

    if "metadata" in request.files:
        sourceMetadata = request.files["metadata"]

    dataset_hash = getUIDForFile(dataset)
    try:
        trackers = process_dataset(
            project, dataset, dataset_hash, version, description, sourceMetadata
        )
    except Exception as ex:
        return handle_exception(ex)

    return jsonify(
        {
            "message": "Dataset uploaded successfully",
            "datasetKey": dataset_hash,
            "trackers": trackers,
        }
    )


@datasetRoute.route("/dataset/status", methods=["POST"])
def getStatus():
    trackers = request.json["trackers"]
    if not trackers:
        return "Need ids"
    status = []
    for tracker in trackers:
        res = celery.AsyncResult(tracker["id"])  # type: ignore
        status.append({"type": tracker["type"], "info": res.info, "status": res.state})

    return jsonify(status)


@datasetRoute.route("/<project>/dataset/<key>", methods=["GET"])
def getDatasetByKey(project: str, key: str):
    engine = getEngine(project)
    with engine.begin() as connection:
        with getSessionScopeFromEngine(connection) as session:
            record = session.query(DatasetRecord).filter(DatasetRecord.key == key).one()
            data = pd.read_sql("Dataset", con=connection)
            data = data[data["record_id"] == str(record.id)]
            data = data.drop(columns=["record_id"])
            data = list(data.T.to_dict().values())

            columnMetadata = (
                session.query(DatasetMetadata)
                .filter(DatasetMetadata.record_id == record.id)
                .all()
            )
            columnMetadata = list(map(lambda x: x.toJSON(), columnMetadata))
            columnInfo = {}
            for column in columnMetadata:
                col_name = column["name"]
                del column["name"]
                columnInfo[col_name] = column

            columns = []
            categoricalColumns = []
            numericColumns = []
            labelColumn = None

            for col_name, col_info in columnInfo.items():
                dataType = col_info["dataType"]
                columns.append(col_name)
                if dataType == "label":
                    labelColumn = col_name
                if dataType == "numeric":
                    numericColumns.append(col_name)
                if dataType == "categorical":
                    categoricalColumns.append(col_name)

            dataset = {
                "columnInfo": columnInfo,
                "labelColumn": labelColumn,
                "categoricalColumns": categoricalColumns,
                "numericColumns": numericColumns,
                "columns": columns,
                "values": data,
            }

            return jsonify(dataset)


@datasetRoute.route("/<project>/dataset/predict/<key>", methods=["POST"])
def predict(project: str, key: str):
    selections = request.json["selections"]
    dimensions = sorted(request.json["dimensions"])
    filtered_ids = []

    if "filtered_ids" in request.json:
        filtered_ids = request.json["filtered_ids"]

    isFiltered = len(filtered_ids) > 0

    engine = getEngine(project)
    with engine.begin() as conn:
        with getSessionScopeFromEngine(conn) as session:

            dataset_record = (
                session.query(DatasetRecord).filter(DatasetRecord.key == key).one()
            )
            if not dataset_record:
                return handle_exception(
                    Exception(422, "NO_DATASET", "This dataset does not exist")
                )

            record_id = dataset_record.id

            dataset = pd.read_sql("Dataset", con=conn)
            dataset = dataset[dataset["record_id"] == str(record_id)]
            dataset = dataset.drop(columns=["record_id"])

            predictions: List[Prediction] = []

            if isFiltered:
                predictions = process_filtered(
                    dataset, selections, dimensions, filtered_ids
                )
            else:
                predictions = process_regular(
                    record_id, dataset, selections, dimensions, session
                )

            return jsonify([e.serialize() for e in predictions])
