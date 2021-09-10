import os

from flask import Flask, jsonify, request

# from flask_cors import CORS
from reapply_workflows import hello, hello2

from server.routes import init_routes

from .celery import configure_celery
from .db import db
from .graphql import init_graphql
from .routes.handle_exception import handle_exception
from .utils.process_dataset import process

app = Flask(__name__)

app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("SQLALCHEMY_DATABASE_URI")
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.secret_key = os.getenv("SECRET_KEY")


init_graphql(app)
init_routes(app)
db.init_app(app)
configure_celery(app)


with app.app_context():
    print("Database Creation")
    db.create_all()


@app.route("/")
def hello_world():
    from .celery.tasks import test_task

    test = test_task.delay()
    return "<pre>{} {} {}</pre>".format(hello(), hello2(), test.task_id)


@app.route("/compare", methods=["POST"])
def compare():
    try:
        body = request.get_json()

        if body is None:
            raise Exception("Error")

        if "base" not in body:
            raise Exception("No base dataset")

        if "target" not in body:
            raise Exception("No target dataset")

        if "provenance" not in body:
            raise Exception("No provenance")

        base = body["base"]
        target = body["target"]
        provenance = body["provenance"]

        return jsonify({"base": base, "target": target, "provenance": provenance})
    except Exception as ex:
        raise ex
        return handle_exception(ex)


@app.route("/upload", methods=["POST"])
def upload():
    if "project" not in request.form:
        return "Specify project name", 400

    if "version" not in request.form:
        return "Specify dataset version", 400

    if "dataset" not in request.files:
        return "Please upload a dataset file", 400

    try:
        project = request.form["project"]
        version = request.form["version"]
        dataset = request.files["dataset"]
        sourceMetadata = (
            request.files["metadata"] if "metadata" in request.files else None
        )

        # if "status" in session and session["status"] == "Uploading":
        #     raise Exception("File upload already in progress, please check status!")
        # else:
        #     session["status"] = "Uploading"

        output = process(project, version, dataset, sourceMetadata)

        return jsonify(output), 200
    except Exception as ex:
        return str(ex), 400
