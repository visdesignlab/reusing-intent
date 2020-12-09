import os

from flask import Flask
from flask_cors import CORS

from backend.server.paths import DATABASE_ROOT

from .routes.datasetRoutes import datasetRoute

app = Flask(__name__)
CORS(app)
app.config["DEBUG"] = True
app.register_blueprint(datasetRoute)


def checkAndInitalizeDatabaseFolder():
    if not os.path.exists(DATABASE_ROOT):
        os.mkdir(DATABASE_ROOT)


def start_server():
    checkAndInitalizeDatabaseFolder()
    app.run()
