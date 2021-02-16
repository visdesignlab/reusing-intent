import os

from flask import Flask

from backend.server.celery.init import celery
from backend.server.celery.utils import configure_celery
from backend.server.paths import DATABASE_ROOT
from backend.server.routes.install_routes import installRoutes

app = Flask(__name__)


def checkAndInitalizeDatabaseFolder():
    if not os.path.exists(DATABASE_ROOT):
        os.mkdir(DATABASE_ROOT)


def start_server():
    checkAndInitalizeDatabaseFolder()
    installRoutes(app)
    configure_celery(celery, app)
    app.run(host="0.0.0.0")
