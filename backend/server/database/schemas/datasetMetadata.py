import json

from sqlalchemy.sql.schema import Column, ForeignKey
from sqlalchemy.sql.sqltypes import Integer, String

from .base import Base


class DatasetMetadata(Base):
    __tablename__ = "Metadata"

    id = Column(Integer, primary_key=True)
    record_id = Column(String, ForeignKey("DatasetRecord.id"), nullable=False)
    name = Column(String, nullable=False)
    fullname = Column(String, nullable=False)
    unit = Column(String)
    short = Column(String, nullable=False)
    dataType = Column(String)
    info = Column(String)

    def toJSON(self):
        return {
            "name": self.name,
            "fullname": self.fullname,
            "unit": self.unit,
            "short": self.short,
            "dataType": self.dataType,
            "info": json.loads(self.info) if self.info else None,
        }
