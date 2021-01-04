from backend.server.extensions import celery


@celery.task(name="tasks.add_task")
def add_task(a, b):
    return a + b
