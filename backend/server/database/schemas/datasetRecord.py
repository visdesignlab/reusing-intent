from sqlalchemy.sql.schema import Column
from sqlalchemy.sql.sqltypes import Integer, String

from backend.server.database.schemas.base import Base


class DatasetRecord(Base):
    __tablename__ = "DatasetRecord"

    id = Column(Integer, primary_key=True)
    key = Column(String, nullable=False, unique=True)
    version = Column(String, nullable=False, unique=True)
    description = Column(String, nullable=False)
    rows = Column(Integer, nullable=False)
    columns = Column(Integer, nullable=False)

    def toJSON(self):
        return {
            "key": self.key,
            "version": self.version,
            "description": self.description,
            "rows": self.rows,
            "columns": self.columns,
        }
