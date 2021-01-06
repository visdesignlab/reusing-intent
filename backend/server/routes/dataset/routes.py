from typing import Any, Dict, List

import pandas as pd
from flask import Blueprint, jsonify, request

from backend.server.database.process_dataset import process_dataset
from backend.server.database.schemas.datasetMetadata import DatasetMetadata
from backend.server.database.schemas.datasetRecord import DatasetRecord
from backend.server.database.session import (
    getEngine,
    getSessionScopeFromEngine,
    getSessionScopeFromId,
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
    process_dataset(
        project, dataset, dataset_hash, version, description, sourceMetadata
    )

    return f"Test {project} {dataset_hash}"


@datasetRoute.route("/<project>/dataset/<key>", methods=["GET"])
def getDatasetByKey(project: str, key: str):
    engine = getEngine(project)
    with engine.begin() as connection:
        with getSessionScopeFromEngine(connection) as session:
            record = session.query(DatasetRecord).filter(DatasetRecord.key == key).one()
            dataset_table_name = f"Dataset_{record.id}"
            data = pd.read_sql(dataset_table_name, con=connection)
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


# @datasetRoute.route("/dataset/<id>", methods=["GET"])
# def getDatasetById(id):
#     session = getDBSession(id)
#     engine = getEngine(id)
#     dataset = {}
#     try:
#         data = session.query(DatasetMetadata).all()
#         columns = {}
#         for d in data:
#             d = d.toJson()
#             col_name = d["name"]
#             del d["name"]
#             columns[col_name] = d
#         dataset["columns"] = columns
#         data = pd.read_sql("Dataset", con=engine)
#         dataset["values"] = list(data.T.to_dict().values())
#         labelColumn = ""
#         numericColumns = []
#         categoricalColumns = []
#         allColumns = []
#         for k, v in columns.items():
#             allColumns.append(k)
#             if v["dataType"] == "label" and labelColumn == "":
#                 labelColumn = k
#             if v["dataType"] == "numeric":
#                 numericColumns.append(k)
#             if v["dataType"] == "categorical":
#                 categoricalColumns.append(k)
#         dataset["labelColumn"] = labelColumn
#         dataset["categoricalColumns"] = categoricalColumns
#         dataset["numericColumns"] = numericColumns
#         dataset["allColumns"] = allColumns
#     except Exception as e:
#         return str(e), 500
#     finally:
#         session.close()

#     return jsonify(dataset)


# @datasetRoute.route("/dataset/process", methods=["POST"])
# def processDataset():
#     if "file" not in request.files:
#         return "No file uploaded", 500
#     file = request.files["file"]
#     columns: Any = None
#     label = None
#     if "label" in request.form:
#         label = request.form["label"]
#     if "columns" in request.files:
#         columns = request.files["columns"]
#     filename = os.path.splitext(file.filename)[0]
#     columnsData = yaml.full_load(columns)

#     data = pd.read_csv(file)

#     task = process.apply_async(args=[data.to_json(), filename, columnsData, label])  # type: ignore

#     return jsonify({"hello": "World", "result": task.id})


# @datasetRoute.route("/<id>/predict", methods=["POST"])
# def predict(id: str):
#     sels = request.json["selections"]
#     dimensions = sorted(request.json["dimensions"])
#     session = getDBSession(id)
#     engine = getEngine(id)
#     try:
#         preds = []
#         dataset = pd.read_sql("Dataset", con=engine)
#         selections = [1 if i in sels else 0 for i in range(dataset.shape[0])]

#         kmeanscluster = (
#             session.query(KMeansCluster)
#             .filter(KMeansCluster.dimensions == ",".join(dimensions))
#             .distinct(KMeansCluster.output)
#             .all()
#         )
#         dbscancluster = (
#             session.query(DBScanCluster)
#             .filter(DBScanCluster.dimensions == ",".join(dimensions))
#             .distinct(DBScanCluster.output)
#             .all()
#         )
#         dbscanoutlier = (
#             session.query(DBScanOutlier)
#             .filter(DBScanOutlier.dimensions == ",".join(dimensions))
#             .distinct(DBScanOutlier.output)
#             .all()
#         )

#         algs = []
#         algs.extend(kmeanscluster)
#         algs.extend(dbscancluster)
#         algs.extend(dbscanoutlier)

#         for a in algs:
#             preds.extend(a.predict(selections))

#         preds = filter(lambda x: x["rank"] > 0.05, preds)
#         preds = list(sorted(preds, key=lambda x: x["rank"], reverse=True))

#         for pred in preds:
#             pred["stats"] = getStats(pred["memberIds"], sels)

#         return jsonify(preds)
#     except Exception as ex:
#         return jsonify(str(ex))
#     finally:
#         session.close()


# def getStats(members, sels):
#     stats = {
#         "ipns": list(set(members) - set(sels)),
#         "isnp": list(set(sels) - set(members)),
#         "matches": list(set(sels).intersection(set(members))),
#     }

#     return stats
