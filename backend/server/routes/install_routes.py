from backend.server.routes.dataset.routes import datasetRoute
from backend.server.routes.project.routes import projectRoute


def installRoutes(app):
    app.register_blueprint(datasetRoute)
    app.register_blueprint(projectRoute)
