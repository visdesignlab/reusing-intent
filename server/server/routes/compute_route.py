import json

import pandas as pd
from flask import Blueprint, jsonify, request
from reapply_workflows.reapply.Graph import Graph

from server.routes.handle_exception import handle_exception

compute_bp = Blueprint("compute", __name__, url_prefix="/compute")


@compute_bp.route("/test", methods=["GET"])
def test():
    return "Testing compute path", 200


@compute_bp.route("/state", methods=["POST"])
def compute_state():
    try:
        body = request.get_json()

        if body is None:
            raise Exception("Resources incorrect!")

        provenance = body["provenance"]
        data = pd.DataFrame(body["data"])
        graph = Graph(**provenance)

        return jsonify(
            json.loads(json.dumps(graph.states(data), default=lambda o: o.toJSON()))
        )
    except Exception as ex:
        raise ex
        return handle_exception(ex)


@compute_bp.route("/compare", methods=["POST"])
def compute_compare():
    try:
        body = request.get_json()

        if body is None:
            raise Exception("Resources incorrect!")

        provenance = body["provenance"]
        base = pd.DataFrame(body["base"])
        updated = pd.DataFrame(body["target"])
        graph = Graph(**provenance)

        compare = graph.compare(base, updated)

        return jsonify(compare)
    except Exception as ex:
        raise ex
        return handle_exception(ex)
