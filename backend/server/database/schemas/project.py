from sqlalchemy.sql.schema import Column
from sqlalchemy.sql.sqltypes import Integer, String

from backend.server.database.schemas.base import Base


class Project(Base):
    __tablename__ = "Project"

    id = Column(Integer, primary_key=True)
    key = Column(String, nullable=False, unique=True)
    name = Column(String, nullable=False)

    def toJSON(self):
        return {"key": self.key, "name": self.name}
