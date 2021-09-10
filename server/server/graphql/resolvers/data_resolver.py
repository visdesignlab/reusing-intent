from io import BytesIO

import pandas as pd

from ...db.models.dataset_meta import DatasetMeta
from ...db.models.dataset_record import DatasetRecord


def resolve_data(*_, record_id):
    try:
        dataset_record = DatasetRecord.query.filter_by(id=record_id).first()
        file = BytesIO(dataset_record.data)
        data = pd.read_parquet(file)
        project_id = dataset_record.project_id

        ci = DatasetMeta.query.filter_by(project_id=project_id).all()

        column_info = {}

        for c in ci:
            col = c.to_dict()
            column_info[col["key"]] = col

        columns = []
        categorical_columns = []
        numeric_columns = []
        label_column = None

        for col_name, col_info in column_info.items():
            data_type = col_info["data_type"]
            columns.append(col_name)
            if data_type == "label":
                label_column = col_name
            elif data_type == "numeric":
                numeric_columns.append(col_name)
            elif data_type == "categorical":
                categorical_columns.append(col_name)

        payload = {
            "success": True,
            "values": list(data.T.to_dict().values()),
            "column_info": column_info,
            "numeric_columns": numeric_columns,
            "categorical_columns": categorical_columns,
            "label_column": label_column,
            "columns": columns,
        }
    except Exception as err:
        payload = {"success": False, "errors": [str(err)]}
    return payload
