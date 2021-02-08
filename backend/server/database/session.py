from contextlib import contextmanager

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from .schemas import *  # noqa: *
from .schemas.base import Base
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


def getDBSessionFromEngine(engine):
    Base.metadata.bind = engine  # type: ignore
    DBSession = sessionmaker(bind=engine)
    sess = DBSession()
    return sess


@contextmanager
def getSessionScopeFromId(id: str):
    session = getDBSession(id)
    try:
        yield session
        session.commit()
    except Exception as ex:
        session.rollback()
        raise ex
    finally:
        session.close()


@contextmanager
def getSessionScopeFromEngine(engine):
    session = getDBSessionFromEngine(engine)
    try:
        yield session
        session.commit()
    except Exception as ex:
        session.rollback()
        raise ex
    finally:
        session.close()
