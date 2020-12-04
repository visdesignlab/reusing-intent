from typing import Any, Dict, List

import pandas as pd
from flask import Blueprint, jsonify, request

from backend.server.database.process_dataset import process_dataset
from backend.server.database.schemas.dataset import DatasetMetadata
from backend.server.database.session import getDBSession, getEngine

datasetRoute = Blueprint("dataset", __name__)


def filter_dict(keys: List[str], old_obj: Dict[str, Any]) -> Dict[str, Any]:
    return {key: old_obj[key] for key in keys}


@datasetRoute.route("/datasets", methods=["GET"])
def getAllDatasets() -> Any:
    return jsonify([])


@datasetRoute.route("/dataset/<id>", methods=["GET"])
def getDatasetById(id):
    session = getDBSession(id)
    engine = getEngine(id)
    dataset = {}
    try:
        data = session.query(DatasetMetadata).all()
        columns = {}
        for d in data:
            d = d.toJson()
            col_name = d["name"]
            del d["name"]
            columns[col_name] = d
        dataset["columns"] = columns
        data = pd.read_sql("Dataset", con=engine)
        dataset["values"] = list(data.T.to_dict().values())
    except Exception as e:
        return str(e), 500
    finally:
        session.close()

    return jsonify(dataset)


@datasetRoute.route("/dataset/process", methods=["POST"])
def processDataset():
    if "file" not in request.files:
        return "No file uploaded", 500
    file = request.files["file"]
    columns = None
    label = None
    if "label" in request.form:
        label = request.form["label"]
    if "columns" in request.files:
        columns = request.files["columns"]
    process_dataset(file, columns, label)

    return "Processing Complete"
