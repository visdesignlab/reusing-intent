from ...db.models.project import Project


def resolve_projects(*_):
    try:
        projects = [
            project.to_dict(show=["datasets"]) for project in Project.query.all()
        ]
        print(projects[0])
        payload = {"success": True, "projects": projects}
    except Exception as error:
        payload = {"success": False, "errors": [str(error)]}
    return payload
