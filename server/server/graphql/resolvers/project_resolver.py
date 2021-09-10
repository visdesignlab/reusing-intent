import string

from ariadne import convert_kwargs_to_snake_case

from ...db import db
from ...db.models.dataset_meta import DatasetMeta
from ...db.models.project import Project


def resolve_projects(*_):
    try:
        projects = [
            project.to_dict(show=["datasets"]) for project in Project.query.all()
        ]
        payload = {"success": True, "projects": projects}
    except Exception as error:
        payload = {"success": False, "errors": [str(error)]}
    return payload


@convert_kwargs_to_snake_case
def resolve_create_project(*_, project_name):
    try:
        project = Project(name=project_name)
        db.session.add(project)
        db.session.commit()
        payload = {"success": True, "project": project.to_dict()}
    except Exception as errors:
        payload = {"success": False, "errors": [errors]}

    return payload


@convert_kwargs_to_snake_case
def resolve_add_category_column(*_, project_id, column_name, options):
    try:
        letters = string.ascii_letters

        shorts = [
            c.short for c in DatasetMeta.query.filter_by(project_id=project_id).all()
        ]

        shorts = list(sorted(shorts))

        last_short = shorts[-1].lower()
        next_short = None

        if last_short == "z":
            next_short = "AA"
        else:
            next_short = letters[letters.index(last_short) + 1].upper()

        meta = DatasetMeta(
            project_id=project_id,
            key=column_name,
            fullname=column_name,
            short=next_short,
            data_type="categorical",
            options=options,
        )

        db.session.add(meta)
        db.session.commit()

        ci = DatasetMeta.query.filter_by(project_id=project_id).all()

        column_info = {}

        for c in ci:
            col = c.to_dict()
            column_info[col["key"]] = col

        columns = []
        categorical_columns = []
        numeric_columns = []
        label_column = None

        for col_name, col_info in column_info.items():
            data_type = col_info["data_type"]
            columns.append(col_name)
            if data_type == "label":
                label_column = col_name
            elif data_type == "numeric":
                numeric_columns.append(col_name)
            elif data_type == "categorical":
                categorical_columns.append(col_name)

        payload = {
            "success": True,
            "column_info": column_info,
            "numeric_columns": numeric_columns,
            "categorical_columns": categorical_columns,
            "label_column": label_column,
            "columns": columns,
        }

    except Exception as errors:
        payload = {"success": False, errors: [errors]}

    return payload
