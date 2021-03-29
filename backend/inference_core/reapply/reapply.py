from typing import Any, Dict

import firebase_admin
import pandas as pd
from firebase_admin import credentials, db

from backend.inference_core.dataset_formatter import format_dataset
from backend.inference_core.reapply.data_structures.Provenance.graph import Graph
from backend.utils.hash import get_hash_for_dataset

app = None


def init_firebase():
    global app
    if app:
        return app
    else:
        cred = credentials.Certificate("backend/inference_core/reapply/cred.json")
        app = firebase_admin.initialize_app(
            cred, {"databaseURL": "https://reusing-intent-default-rtdb.firebaseio.com"}
        )

    return app


class Result:
    def __init__(self, workflow, graph):
        self.graph = graph
        self.workflow = workflow
        self.isApproved = graph.isApprovedForAll

    @property
    def results(self):
        if not self.isApproved:
            print(
                f"This workflow is not approved for all interactions. Please go to following url: http://localhost:3000/#/project?workflow={self.workflow.id}&project={self.workflow.project}&data={self.graph.target_id}"
            )
        return self.graph.results

    @property
    def description(self):
        return self.workflow.describe

    def pretty_print(self):
        self.graph.pretty_print()


class Workflow:
    def __init__(self, id, graph, name, project, **kwargs):
        self.id = id
        self._name = name
        self.project = project
        self.g = graph

    @property
    def name(self):
        return self._name

    @property
    def describe(self):
        return self._name

    def apply(self, target: pd.DataFrame, label: str):
        columns = target.columns
        columns = sorted(columns)
        target = target[columns]
        target = format_dataset(target, label)
        target_id = get_hash_for_dataset(target)

        graph = Graph(target=target, target_id=target_id, **self.g)

        return Result(self, graph)


class Reapply:
    def __init__(self):
        init_firebase()
        self._workflows: Dict[str, Workflow] = {}

    def add_workflow(self, id: str):
        ref = db.reference(id)
        workflow: Any = ref.get()
        self._workflows[id] = Workflow(**workflow)
        return self._workflows[id]

    @property
    def workflows(self):
        return list(self._workflows.values())
