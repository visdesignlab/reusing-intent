import json
from io import BytesIO

import pandas as pd
from flask import Blueprint, jsonify

from server.db.models.dataset_meta import DatasetMeta
from server.db.models.dataset_record import DatasetRecord
from server.routes.handle_exception import handle_exception

dataset_bp = Blueprint("data", __name__, url_prefix="/data")


@dataset_bp.route("/test", methods=["GET"])
def test():
    return "Testing base path", 200


@dataset_bp.route("/<rid>", methods=["GET"])
def get_data(rid: str):
    try:
        record = DatasetRecord.query.filter_by(id=rid).first()
        pid = record.project_id
        file = BytesIO(record.data)
        data = pd.read_parquet(file)

        col_infos = DatasetMeta.query.filter_by(project_id=pid).all()

        column_info = {}
        columns = []
        categorical_columns = []
        numeric_columns = []
        label_column = None

        for c in col_infos:
            columns.append(c.key)

            c_type = c.data_type

            if c_type == "label":
                label_column = c.key
            elif c_type == "numeric":
                numeric_columns.append(c.key)
            elif c_type == "categorical":
                categorical_columns.append(c.key)

            col = c.to_dict()
            column_info[c.key] = col

        d = data.T.to_json()

        return (
            jsonify(
                {
                    "values": list(json.loads(d).values()),
                    "columnInfo": column_info,
                    "numericColumns": numeric_columns,
                    "categoricalColumns": categorical_columns,
                    "labelColumn": label_column,
                    "columns": columns,
                    "id": rid,
                    "version": record.version,
                }
            ),
            200,
        )
    except Exception as e:
        raise e
        return handle_exception(e)
