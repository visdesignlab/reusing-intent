from sqlalchemy.sql.schema import Column
from sqlalchemy.sql.sqltypes import Integer, String

from ..base import Base


class DatasetMetadata(Base):
    __tablename__ = "Metadata"

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    fullname = Column(String, nullable=False)
    unit = Column(String)
    short = Column(String, nullable=False)
    dataType = Column(String)

    def toJson(self):
        return {
            "name": self.name,
            "fullname": self.fullname,
            "unit": self.unit,
            "short": self.short,
            "dataType": self.dataType,
        }
