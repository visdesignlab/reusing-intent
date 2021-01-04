from backend.server.routes.datasetRoutes import datasetRoute


def installRoutes(app):
    app.register_blueprint(datasetRoute)
