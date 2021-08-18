from io import BytesIO

import pandas as pd
from reapply_workflows.inference.inference import Inference
from reapply_workflows.inference.interaction import Interactions

from ...db.models.dataset_record import DatasetRecord


def resolve_predictions(*_, record_id, interactions):
    try:
        record = DatasetRecord.query.filter_by(id=record_id).first()

        data_raw = BytesIO(record.data)

        data = pd.read_parquet(data_raw)

        interactions = Interactions(interactions)

        dimensions, selections = interactions.inferSelectionsAndDimensions(data)

        print(len(selections))

        if len(selections) == 0:
            return {
                "success": True,
                "predictions": [],
            }

        inference = Inference(data, selections, dimensions, [])

        predictions = inference.predict()

        predictions = list(
            sorted(predictions, key=lambda x: x.rank_jaccard, reverse=True)
        )

        high_ranking_preds = list(filter(lambda x: x.rank_jaccard > 0.5, predictions))

        if len(high_ranking_preds) < 20:
            predictions = predictions[0:20]
        else:
            predictions = high_ranking_preds

        payload = {
            "success": True,
            "predictions": map(lambda x: x.to_dict(), predictions),
        }
    except Exception as err:
        payload = {"success": False, "errors": [str(err)]}
        raise err
    return payload
