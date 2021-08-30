import pandas as pd
from flask import Blueprint, jsonify, request
from reapply_workflows.compute.get_members import get_members
from reapply_workflows.inference.inference import Inference

from server.routes.handle_exception import handle_exception

prediction_bp = Blueprint("predict", __name__, url_prefix="/predict")


@prediction_bp.route("/", methods=["POST"])
def get_predictions():
    try:
        body = request.get_json()

        if body is None:
            raise Exception("No interactions found")

        data = pd.DataFrame(body["data"])
        dimensions = body["dimensions"]
        selections = body["selections"]

        if len(selections) == 0:
            return jsonify([])

        inference = Inference(data, selections, dimensions, [])

        predictions = inference.predict()

        high_ranking_preds = list(filter(lambda x: x.rank_jaccard > 0.5, predictions))

        if len(high_ranking_preds) >= 20:
            predictions = high_ranking_preds
        else:
            predictions = predictions[:20]

        return jsonify(list(map(lambda x: x.to_dict(), predictions)))
    except Exception as e:
        raise e
        return handle_exception(e)


@prediction_bp.route("/members", methods=["POST"])
def get_members_route():
    try:
        body = request.get_json()

        if body is None:
            raise Exception("No intent provided")

        data = body["data"]
        intent = body["intent"]
        algorithm = body["algorithm"]
        params = body["params"]
        dimensions = body["dimensions"]
        info = body["info"]

        data = pd.DataFrame(data)

        return jsonify(get_members(data, dimensions, intent, algorithm, params, info))
    except Exception as e:
        return handle_exception(e)
