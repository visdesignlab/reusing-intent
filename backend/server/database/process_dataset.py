import os

import pandas as pd
import yaml

from backend.server.database.schemas.dataset import DatasetMetadata
from backend.server.database.session import (
    dropAllTables,
    getDBSession,
    getEngine,
    initializeDatabase,
)

chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"


def process_dataset(file, columnsData, label):
    filename = os.path.splitext(file.filename)[0]
    data = pd.read_csv(file)
    data = data.infer_objects()
    # TODO: Maybe convert datatype of df when not matching according to columnsData
    metadata = getMetadata(data, columnsData, label)

    dropAllTables(filename)
    initializeDatabase(filename)
    uploadDataset(data, filename)
    uploadMetadata(metadata, filename)


def getMetadata(data: pd.DataFrame, columnsData=None, label=None):
    metadata = {}

    for count, (column, values) in enumerate(data.iteritems()):
        dataType = values.dtype
        if label == column:
            dataType = "label"
        elif dataType == "object":
            dataType = "categorical"
        elif "int" in str(dataType) or "float" in str(dataType):
            dataType = "numeric"
        desc = {
            "fullname": column,
            "unit": None,
            "short": chars[count],
            "dataType": dataType,
        }
        metadata[column] = desc

    if columnsData:
        cols = yaml.full_load(columnsData)
        for col, val in cols["columns"].items():
            for k, v in val.items():
                metadata[col][k] = v

    return metadata


def uploadDataset(data: pd.DataFrame, filename: str):
    engine = getEngine(filename)
    data.to_sql("Dataset", con=engine, if_exists="replace", index=False)


def uploadMetadata(metadata, filename: str):
    session = getDBSession(filename)
    try:
        for k, v in metadata.items():
            fullname, unit, short, dataType = v.values()
            d = DatasetMetadata(
                name=k, fullname=fullname, unit=unit, short=short, dataType=dataType
            )
            session.add(d)
        session.commit()
    except Exception as e:
        raise e
    finally:
        session.close()
