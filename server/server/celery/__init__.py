import os
from typing import Any

from celery import Celery
from flask import Flask


def make_celery_app(app_name=__name__):
    redis_uri = os.environ["REDIS_URI"]
    celery_app = Celery(
        app_name, backend=redis_uri, broker=redis_uri, include=["server.celery.tasks"]
    )
    celery_app.conf.task_track_started = True
    return celery_app


celery_app = make_celery_app()


def configure_celery(app: Flask):
    celery_app.conf.update(app.config)

    TaskBase: Any = celery_app.Task

    class ContextTask(TaskBase):
        def __call__(self, *args, **kwargs):
            with app.app_context():
                return TaskBase.__call__(self, *args, **kwargs)

    celery_app.Task = ContextTask
