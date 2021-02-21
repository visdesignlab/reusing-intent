from typing import List

import pandas as pd

from backend.inference_core.prediction import Prediction


def process_predictions(predictions: List[Prediction]) -> List[Prediction]:
    preds = pd.DataFrame(
        [
            [pred.get_hash(), pred.rank, pred.algorithm, pred.intent, pred.info, pred]
            for pred in predictions
        ],
        columns=["hash", "rank", "algorithm", "intent", "info", "prediction"],
    )

    preds = filter_low_ranks(preds)
    preds = filter_duplicate_predictions(preds)
    preds = sort_by_rank(preds)

    return preds["prediction"].tolist()


def filter_low_ranks(prediction: pd.DataFrame):
    return prediction[prediction["rank"] >= 0.1]


def sort_by_rank(predictions: pd.DataFrame):
    return predictions.sort_values("rank", ascending=False)


def filter_duplicate_predictions(predictions: pd.DataFrame):
    preds = (
        predictions.groupby("hash")
        .apply(lambda x: x.nlargest(1, ["rank"]))
        .reset_index(drop=True)
    )

    return preds
