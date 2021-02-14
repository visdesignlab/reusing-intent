import os

from celery import Celery


def make_celery(app_name=__name__):
    redis_uri = os.environ["REDIS_URI"]
    app = Celery(
        app_name,
        backend=redis_uri,
        broker=redis_uri,
        include=["backend.server.celery.tasks"],
    )

    app.conf.task_track_started = True

    return app


celery = make_celery()
