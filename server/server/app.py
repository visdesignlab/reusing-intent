import os
import pprint

from flask import Flask
from reapply_workflows import hello, hello2

from .db import db
from .db.models.dataset_record import DatasetRecord
from .db.models.project import Project
from .graphql import init_graphql

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("SQLALCHEMY_DATABASE_URI")
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False


init_graphql(app)
db.init_app(app)

pp = pprint.PrettyPrinter()

with app.app_context():
    db.create_all()
    db.drop_all()
    db.create_all()
    project = Project(name="Test")
    db.session.add(project)

    db.session.commit()

    # database_record = dat
    dataset_rec = DatasetRecord(version="1", project_id=project.id)
    db.session.add(dataset_rec)
    dataset_rec = DatasetRecord(version="2", project_id=project.id)
    db.session.add(dataset_rec)

    project = Project(name="Test er")
    db.session.add(project)

    db.session.commit()

    dataset_rec = DatasetRecord(version="1.3", project_id=project.id)
    db.session.add(dataset_rec)
    dataset_rec = DatasetRecord(version="2.4", project_id=project.id)
    db.session.add(dataset_rec)

    db.session.commit()
    pp.pprint([p.to_dict() for p in Project.query.all()])


@app.route("/")
def hello_world():
    return "<pre>{} {}</pre>".format(hello(), hello2())
