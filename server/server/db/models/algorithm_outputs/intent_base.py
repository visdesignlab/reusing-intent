# type: ignore

from abc import abstractmethod

from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.declarative import declared_attr

from ... import db
from ..base import BaseModel
from ..dataset_record import DatasetRecord


class IntentBase(BaseModel):
    __abstract__ = True

    params = db.Column(db.String, nullable=False, default="-")
    info = db.Column(db.String, nullable=False, default="-")
    dimensions = db.Column(db.String, nullable=False)
    output = db.Column(db.String, nullable=False)

    @declared_attr
    def record_id(cls):
        return db.Column(
            UUID(as_uuid=True),
            db.ForeignKey(DatasetRecord.id, ondelete="CASCADE"),
            nullable=False,
        )

    @property
    @abstractmethod
    def algorithm(self) -> str:
        pass

    @property
    @abstractmethod
    def intent(self) -> str:
        pass

    _default_fields = ["record_id", "info", "dimensions"]
    _hidden_fields = []
    _readonly_fields = []
