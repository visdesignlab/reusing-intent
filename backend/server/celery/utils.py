from typing import Any

from celery import Celery
from flask import Flask


def configure_celery(celery: Celery, app: Flask):
    celery.conf.update(app.config)

    TaskBase: Any = celery.Task

    class ContextTask(TaskBase):
        def __call__(self, *args, **kwargs):
            with app.app_context():
                return TaskBase.__call__(self, *args, **kwargs)

    celery.Task = ContextTask
