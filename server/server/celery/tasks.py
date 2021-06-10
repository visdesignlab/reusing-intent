import os

from flask import Flask

from ..db import db
from . import celery_app as celery
from .precompute_outliers import (
    compute_dbscan_outliers,
    compute_isolationforest_outliers,
)

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("SQLALCHEMY_DATABASE_URI")
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.secret_key = os.getenv("SECRET_KEY")
db.init_app(app)


@celery.task(bind=True)
def test_task(self):
    print("Hello")


@celery.task(bind=True)
def precompute_dbscan_outliers(self, data, combinations, record_id):
    with app.app_context():
        compute_dbscan_outliers(self, data, combinations, record_id)


@celery.task(bind=True)
def precompute_isolationforest_outliers(self, data, combinations, record_id):
    with app.app_context():
        compute_isolationforest_outliers(self, data, combinations, record_id)
