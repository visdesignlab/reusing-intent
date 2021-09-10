import string

from flask import Blueprint, jsonify, request

from server.db.models.dataset_meta import DatasetMeta
from server.db.models.project import Project
from server.routes.handle_exception import handle_exception

from ..db import db

project_bp = Blueprint("project", __name__, url_prefix="/project")


def get_column_key(col_name):
    return "".join(["_" + c.lower() if c.isupper() else c for c in col_name]).lstrip(
        "_"
    )


@project_bp.route("/test", methods=["GET"])
def test():
    return "Testing base path", 200


@project_bp.route("/all", methods=["GET"])
def get_all_projects():
    try:
        projects = [
            project.to_dict(show=["datasets"]) for project in Project.query.all()
        ]

        return jsonify(projects)
    except Exception as e:
        return handle_exception(e)


@project_bp.route("/create", methods=["POST"])
def create_project():
    try:
        body = request.get_json()

        if body is None:
            raise Exception("No project name specified")

        p_name = body["p_name"]

        project = Project(name=p_name)
        db.session.add(project)
        db.session.commit()

        project = project.to_dict()

        return jsonify(project), 200
    except Exception as e:
        return handle_exception(e)


@project_bp.route("/column", methods=["POST"])
def add_category_column():
    try:
        body = request.get_json()

        if body is None:
            raise Exception("No data specified")

        pid = body["pid"]
        column_name = body["c_name"]
        options = body["options"]

        letters = string.ascii_uppercase
        shorts = [c.short for c in DatasetMeta.query.filter_by(project_id=pid).all()]
        shorts = list(sorted(shorts))

        last_short = shorts[-1]
        next_short = None

        if last_short == "Z":
            raise Exception("Too many categories")
        else:
            next_short = letters[letters.index(last_short) + 1]

        new_category_column = DatasetMeta(
            project_id=pid,
            key=get_column_key(column_name),
            fullname=column_name,
            short=next_short,
            data_type="categorical",
            options=options,
        )
        db.session.add(new_category_column)
        db.session.commit()

        col_infos = DatasetMeta.query.filter_by(project_id=pid).all()

        column_info = {}
        columns = []
        categorical_columns = []
        numeric_columns = []
        label_column = None

        for c in col_infos:
            columns.append(c.key)

            c_type = c.data_type

            if c_type == "label":
                label_column = c.key
            elif c_type == "numeric":
                numeric_columns.append(c.key)
            elif c_type == "categorical":
                categorical_columns.append(c.key)

            col = c.to_dict()
            column_info[c.key] = col

        return jsonify(
            {
                "column_info": column_info,
                "numeric_columns": numeric_columns,
                "categorical_columns": categorical_columns,
                "label_column": label_column,
                "columns": columns,
            }
        )
    except Exception as e:
        return handle_exception(e)
