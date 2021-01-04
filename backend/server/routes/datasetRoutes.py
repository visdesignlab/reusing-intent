import os
from typing import Any, Dict, List

import pandas as pd
import yaml
from flask import Blueprint, jsonify, request

from backend.server.celery.tasks import process
from backend.server.database.schemas.algorithms.cluster import (
    DBScanCluster,
    KMeansCluster,
)
from backend.server.database.schemas.algorithms.outlier import DBScanOutlier
from backend.server.database.schemas.dataset import DatasetMetadata
from backend.server.database.session import getDBSession, getEngine
from backend.server.paths import DATABASE_ROOT

datasetRoute = Blueprint("dataset", __name__)


def filter_dict(keys: List[str], old_obj: Dict[str, Any]) -> Dict[str, Any]:
    return {key: old_obj[key] for key in keys}


@datasetRoute.route("/datasets", methods=["GET"])
def getAllDatasets() -> Any:
    arr = list(map(lambda x: x.split(".")[0], os.listdir(DATABASE_ROOT)))
    return jsonify(arr)


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
        labelColumn = ""
        numericColumns = []
        categoricalColumns = []
        allColumns = []
        for k, v in columns.items():
            allColumns.append(k)
            if v["dataType"] == "label" and labelColumn == "":
                labelColumn = k
            if v["dataType"] == "numeric":
                numericColumns.append(k)
            if v["dataType"] == "categorical":
                categoricalColumns.append(k)
        dataset["labelColumn"] = labelColumn
        dataset["categoricalColumns"] = categoricalColumns
        dataset["numericColumns"] = numericColumns
        dataset["allColumns"] = allColumns
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
    columns: Any = None
    label = None
    if "label" in request.form:
        label = request.form["label"]
    if "columns" in request.files:
        columns = request.files["columns"]
    filename = os.path.splitext(file.filename)[0]
    columnsData = yaml.full_load(columns)

    data = pd.read_csv(file)

    task = process.apply_async(args=[data.to_json(), filename, columnsData, label])  # type: ignore

    return jsonify({"hello": "World", "result": task.id})


# @datasetRoute.route("/dataset/jobs", methods=["GET"])
# def getJobs():
#     running_jobs = registry.get_job_ids()
#     expired_jobs = registry.get_expired_job_ids()
#     return jsonify({"running": running_jobs, "expired": expired_jobs})


# @datasetRoute.route("/dataset/cancel", methods=["GET"])
# def cancelJobs():
#     running_jobs: Any = registry.get_job_ids()
#     if not running_jobs or len(running_jobs) == 0:
#         return "No jobs running"

#     for id in running_jobs:
#         try:
#             send_stop_job_command(conn, id)
#         except Exception as ex:
#             return f"Failed to stop job: {id}\n{str(ex)}"

#     return f"Stopped jobs with ids: {', '.join(running_jobs)}"


# @datasetRoute.route("/check/<id>", methods=["GET"])
# def checkProcess(id: str):
#     job = queue.fetch_job(id)
#     job.refresh()
#     print(job.meta)
#     return jsonify({"meta": job.meta, "id": id})


@datasetRoute.route("/<id>/predict", methods=["POST"])
def predict(id: str):
    sels = request.json["selections"]
    dimensions = sorted(request.json["dimensions"])
    session = getDBSession(id)
    engine = getEngine(id)
    try:
        preds = []
        dataset = pd.read_sql("Dataset", con=engine)
        selections = [1 if i in sels else 0 for i in range(dataset.shape[0])]

        kmeanscluster = (
            session.query(KMeansCluster)
            .filter(KMeansCluster.dimensions == ",".join(dimensions))
            .distinct(KMeansCluster.output)
            .all()
        )
        dbscancluster = (
            session.query(DBScanCluster)
            .filter(DBScanCluster.dimensions == ",".join(dimensions))
            .distinct(DBScanCluster.output)
            .all()
        )
        dbscanoutlier = (
            session.query(DBScanOutlier)
            .filter(DBScanOutlier.dimensions == ",".join(dimensions))
            .distinct(DBScanOutlier.output)
            .all()
        )

        algs = []
        algs.extend(kmeanscluster)
        algs.extend(dbscancluster)
        algs.extend(dbscanoutlier)

        for a in algs:
            preds.extend(a.predict(selections))

        preds = filter(lambda x: x["rank"] > 0.05, preds)
        preds = list(sorted(preds, key=lambda x: x["rank"], reverse=True))

        for pred in preds:
            pred["stats"] = getStats(pred["memberIds"], sels)

        return jsonify(preds)
    except Exception as ex:
        return jsonify(str(ex))
    finally:
        session.close()


def getStats(members, sels):
    stats = {
        "ipns": list(set(members) - set(sels)),
        "isnp": list(set(sels) - set(members)),
        "matches": list(set(sels).intersection(set(members))),
    }

    return stats
