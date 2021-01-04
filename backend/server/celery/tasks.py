import pandas as pd

from backend.server.celery.init import celery
from backend.server.database.process_dataset import process_dataset


@celery.task
def process(data, id, columns, label):
    data = pd.read_json(data)
    process_dataset(data, id, columns, label)
