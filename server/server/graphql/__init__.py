from ariadne import (
    graphql_sync,
    load_schema_from_path,
    make_executable_schema,
    snake_case_fallback_resolvers,
)
from ariadne.constants import PLAYGROUND_HTML
from flask import Blueprint, Flask, jsonify, request

from .resolvers import mutation, query

graphql_bp = Blueprint("graphql", __name__, url_prefix="/graphql")

type_defs = load_schema_from_path("/code/server/server/graphql/schemas/")

schema = make_executable_schema(
    type_defs, query, mutation, snake_case_fallback_resolvers
)


@graphql_bp.route("/", methods=["GET"])
def graphql_playground():
    return PLAYGROUND_HTML, 200


@graphql_bp.route("/", methods=["POST"])
def graphql_server():
    data = request.get_json()

    success, result = graphql_sync(schema, data, context_value=request)

    status_code = 200 if success else 400
    return jsonify(result), status_code


def init_graphql(app: Flask):
    app.register_blueprint(graphql_bp)
    return app
