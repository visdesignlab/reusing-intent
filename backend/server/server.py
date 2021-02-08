import os

from flask import Flask
from flask_cors import CORS

from backend.server.celery.init import celery
from backend.server.celery.utils import configure_celery
from backend.server.paths import DATABASE_ROOT
from backend.server.routes.install_routes import installRoutes

app = Flask(__name__)
CORS(app)
app.config["DEBUG"] = True


def checkAndInitalizeDatabaseFolder():
    if not os.path.exists(DATABASE_ROOT):
        os.mkdir(DATABASE_ROOT)


def start_server():
    checkAndInitalizeDatabaseFolder()
    installRoutes(app)
    configure_celery(celery, app)
    app.run()
