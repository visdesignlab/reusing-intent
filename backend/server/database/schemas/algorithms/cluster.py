from sqlalchemy.sql.schema import Column
from sqlalchemy.sql.sqltypes import Float, Integer

from ...base import Base


class ClusterBase:
    rowId = Column(Integer, nullable=False)
    clusterId = Column(Integer, nullable=False)


class DBScanCluster(Base, ClusterBase):
    __tablename__ = "DBScanCluster"

    id = Column(Integer, primary_key=True)
    eps = Column(Float, nullable=False)
    min_samples = Column(Integer, nullable=False)
