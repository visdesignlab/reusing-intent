# type: ignore
from .. import db
from .base import BaseModel


class Project(BaseModel):
    name = db.Column(db.String, nullable=False, unique=True)
    datasets = db.relationship("DatasetRecord", backref="project", lazy="joined")

    _default_fields = ["name", "datasets"]
    _hidden_fields = []
    _readonly_fields = []
