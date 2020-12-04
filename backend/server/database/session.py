from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from .base import Base
from .schemas import *  # noqa: *
from .utils import getDatabasePath


def getEngine(id: str):
    return create_engine(f"sqlite:///{getDatabasePath(id)}")


def dropAllTables(id: str):
    engine = getEngine(id)
    Base.metadata.drop_all(engine)  # type: ignore


def initializeDatabase(id: str):
    engine = getEngine(id)
    Base.metadata.create_all(engine)  # type: ignore


def getDBSession(id: str):
    engine = getEngine(id)
    Base.metadata.bind = engine  # type: ignore
    DBSession = sessionmaker(bind=engine)
    sess = DBSession()
    return sess
