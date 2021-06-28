# type: ignore
from sqlalchemy.dialects.postgresql import UUID

from .. import db
from .base import BaseModel


class Workflow(BaseModel):
    project_id = db.Column(
        UUID(as_uuid=True), db.ForeignKey("project.id"), nullable=False
    )
