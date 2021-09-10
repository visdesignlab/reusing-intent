# type: ignore
from typing import List

from sqlalchemy.dialects.postgresql import UUID

from .. import db
from .base import BaseModel


class DatasetMeta(BaseModel):
    project_id = db.Column(
        UUID(as_uuid=True), db.ForeignKey("project.id"), nullable=False
    )
    key = db.Column(db.String, nullable=False)
    fullname = db.Column(db.String, nullable=False)
    unit = db.Column(db.String)
    short = db.Column(db.String, nullable=False)
    data_type = db.Column(db.String, nullable=False)

    _options = db.Column(db.String)

    @property
    def options(self):
        if self._options:
            return self._options.split(",")
        return self._options

    @options.setter
    def options(self, options):
        self._options = options

    _default_fields = ["key", "fullname", "unit", "short", "data_type", "options"]
    _hidden_fields = []
    _readonly_fields = []

    @classmethod
    def add_category(
        cls, fullname: str, short: str, unit: str = None, options: List[str] = []
    ):
        ob = cls(
            fullname=fullname,
            short=short,
            unit=unit,
            data_type="categorical",
            options=",".join(options),
        )
        db.session.add(ob)
        db.session.commit()
