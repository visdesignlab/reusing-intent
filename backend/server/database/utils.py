import os

from sqlalchemy.engine import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql.schema import Column
from sqlalchemy.sql.sqltypes import Integer, String

from ..paths import DATABASE_ROOT


def getDatabasePath(id):
    return os.path.join(DATABASE_ROOT, f"{id}.db")


Base = declarative_base()


class Book(Base):
    __tablename__ = "book"

    id = Column(Integer, primary_key=True)
    title = Column(String(250), nullable=False)


engine = create_engine("sqlite:///TEST.db")

Base.metadata.create_all(engine)  # type: ignore

Base.metadata.bind = engine  # type: ignore

# DBSession = sessionmaker(bind=engine)

# session = DBSession()

# entryName = Book(title="Hello 2")

# session.add(entryName)

# session.commit()
