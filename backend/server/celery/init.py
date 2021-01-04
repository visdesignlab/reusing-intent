from celery import Celery


def make_celery(app_name=__name__):
    redis_uri = "redis://"
    return Celery(
        app_name,
        backend=redis_uri,
        broker=redis_uri,
        include=["backend.server.celery.tasks"],
    )


celery = make_celery()
