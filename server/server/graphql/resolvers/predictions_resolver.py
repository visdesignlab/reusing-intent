from io import BytesIO

import pandas as pd
from reapply_workflows.inference.inference import Inference
from reapply_workflows.inference.intent import Intent as IRW

from ...db.models.dataset_record import DatasetRecord
from ...db.models.intent import Intent


def resolve_predictions(*_, record_id):
    try:
        record = DatasetRecord.query.filter_by(id=record_id).first()

        data_raw = BytesIO(record.data)

        data = pd.read_parquet(data_raw)

        dimensions = sorted(["cmr", "tfr"])

        intents = (
            Intent.query.filter_by(record_id=record_id)
            .filter_by(dimensions=",".join(dimensions))
            .all()
        )

        user_sel = data.sample(n=50, random_state=1).id.to_list()

        inference = Inference(data, user_sel, dimensions, [])

        predictions = inference.predict()

        payload = {
            "success": True,
            "predictions": map(lambda x: x.to_dict(), predictions),
        }
    except Exception as err:
        payload = {"success": False, "errors": [str(err)]}
        raise err
    return payload
