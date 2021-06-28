# type: ignore


from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.declarative import declared_attr

from .. import db
from .base import BaseModel
from .dataset_record import DatasetRecord


class Intent(BaseModel):
    params = db.Column(db.String, nullable=False, default="{}")
    info = db.Column(db.String, nullable=False, default="{}")
    dimensions = db.Column(db.String, nullable=False)
    output = db.Column(db.String, nullable=False)
    algorithm = db.Column(db.String, nullable=False)
    intent = db.Column(db.String, nullable=False)

    @declared_attr
    def record_id(cls):
        return db.Column(
            UUID(as_uuid=True),
            db.ForeignKey(DatasetRecord.id, ondelete="CASCADE"),
            nullable=False,
        )

    @property
    def results(self) -> str:
        output = map(int, self.output.split(","))
        return list(output)

    _default_fields = [
        "record_id",
        "info",
        "dimensions",
        "params",
        "results",
        "algorithm",
        "output",
        "intent",
    ]
    _hidden_fields = []
    _readonly_fields = []
