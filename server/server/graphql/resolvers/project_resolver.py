from ariadne import convert_kwargs_to_snake_case

from ...db import db
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
        print("Test")
        project = Project(name=project_name)
        db.session.add(project)
        db.session.commit()
        payload = {"success": True, "project": project.to_dict()}
    except Exception as errors:
        payload = {"success": False, "errors": [errors]}

    print(payload)
    return payload
