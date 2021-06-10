# type: ignore
from sqlalchemy.dialects.postgresql import UUID

from .. import db
from .base import BaseModel


class DatasetRecord(BaseModel):
    version = db.Column(db.String, nullable=False, unique=True)
    project_id = db.Column(
        UUID(as_uuid=True), db.ForeignKey("project.id"), nullable=False
    )
    hash = db.Column(db.String, nullable=False)
    meta = db.Column(db.String, nullable=False)
    data = db.Column(db.LargeBinary, nullable=False)

    _default_fields = ["version", "project_id"]
    _hidden_fields = ["data"]
    _readonly_fields = []
