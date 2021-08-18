from flask import Flask

from .dataset_route import dataset_bp
from .prediction_route import prediction_bp
from .project_route import project_bp


def init_routes(app: Flask):
    app.register_blueprint(dataset_bp)
    app.register_blueprint(project_bp)
    app.register_blueprint(prediction_bp)
