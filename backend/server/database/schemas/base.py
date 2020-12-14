import abc

from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.ext.declarative.api import DeclarativeMeta


class DeclarativeABCMeta(DeclarativeMeta, abc.ABCMeta):
    pass


class Base(declarative_base(metaclass=DeclarativeABCMeta)):
    __abstract__ = True


# Base = declarative_base(cls=DeclarativeABCMeta)
