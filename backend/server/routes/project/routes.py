import os

from flask import Blueprint, jsonify, request

from backend.server.database.schemas.project import Project
from backend.server.database.session import (
    dropAllTables,
    getDBSession,
    initializeDatabase,
)
from backend.server.paths import DATABASE_ROOT
from backend.server.routes.utils import handle_exception

projectRoute = Blueprint("project", __name__)


@projectRoute.route("/project", methods=["GET"])
def getAllProjects():
    """List all projects endpoint
    -------
    get:
        description: Gets all the available projects
    """

    arr = list(
        filter(lambda x: x, map(lambda x: x.split(".")[0], os.listdir(DATABASE_ROOT)))
    )

    projects = []

    for proj in arr:
        session = getDBSession(proj)
        try:
            project = session.query(Project).one()
            projects.append(project.toJSON())
        except Exception as ex:
            return handle_exception(ex)
        finally:
            session.close()

    return jsonify(projects)


@projectRoute.route("/project/<key>", methods=["POST"])
def createProject(key: str):
    if "reset" in request.form:
        dropAllTables(key)
    initializeDatabase(key)
    session = getDBSession(key)

    try:
        count = session.query(Project).count()

        if count > 0:
            raise Exception(422, "PROJECT_EXISTS", "Project already exists")

        if "name" not in request.form:
            raise Exception(400, "PROJECT_NAME_MISSING", "Please provide project name")

        name = request.form["name"]
        project = Project(key=key, name=name)
        session.add(project)
        session.commit()
        return jsonify({"message": "Project added successfully"})
    except Exception as ex:
        session.rollback()
        return handle_exception(ex)
    finally:
        session.close()


@projectRoute.route("/project/<project>/provenance", methods=["POST"])
def processProvenance(project):
    graph = request.json
    nodes = graph["nodes"]
    current_id = graph["current"]

    interactions = []

    current = nodes[current_id]

    while True:
        interactions.append(current)
        if "parent" in current:
            current = nodes[current["parent"]]
        else:
            break

    interactions = list(reversed(interactions))

    actions = []

    for interaction in interactions:
        if "diffs" in interaction:
            del interaction["diffs"]
        label = interaction["label"]
        if label == "Root" or "Change Dataset" in label:
            continue
        state = interaction["state"]
        if "Add Plot" in label:
            actions.append(
                {
                    "type": "Add Plot",
                    "x": state["plots"][0]["x"],
                    "y": state["plots"][0]["y"],
                }
            )
        if "Brush" in label:
            actions.append(
                {
                    "type": "Point Selection",
                    "selectedPoints": state["plots"][0]["selectedPoints"],
                }
            )
        if "Prediction" in label:
            actions.append(
                {
                    "type": "Prediction Selection",
                    "prediction": state["selectedPrediction"],
                }
            )

    return jsonify(actions)
