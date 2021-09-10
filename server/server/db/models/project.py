# type: ignore
from .. import db
from .base import BaseModel
from .dataset_meta import DatasetMeta  # noqa
from .dataset_record import DatasetRecord  # noqa
from .workflow import Workflow  # noqa


class Project(BaseModel):
    name = db.Column(db.String, nullable=False, unique=True)
    datasets = db.relationship("DatasetRecord", backref="project", lazy="joined")
    meta = db.relationship("DatasetMeta", backref="project", lazy="joined")

    _default_fields = ["name", "datasets", "meta"]
    _hidden_fields = []
    _readonly_fields = []
