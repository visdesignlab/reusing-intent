from ariadne import QueryType, gql, graphql_sync, make_executable_schema
from ariadne.constants import PLAYGROUND_HTML
from flask import Blueprint, Flask, jsonify, request

graphql_bp = Blueprint("graphql", __name__, url_prefix="/graphql")

type_defs = gql(
    """
    type Query {
        hello: String!
    }
"""
)

query = QueryType()


@query.field("hello")
def resolve_hello(_, info):
    req = info.context
    user_agent = req.headers.get("User-Agent", "Guest")
    return "Hello, {}".format(user_agent)


schema = make_executable_schema(type_defs, query)


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
