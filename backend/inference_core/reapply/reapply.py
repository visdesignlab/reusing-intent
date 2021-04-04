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
        cred = credentials.Certificate(
            {
                "type": "service_account",
                "project_id": "reusing-intent",
                "private_key_id": "7a2aa3b441a49fe94499768687d72b6aaa47b9f4",
                "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDFAmW1IpOtY5E5\nmKU2Qsa/mf7RRREYjFkuh49FJRonalD2gjVntsk58+zazzNLH6aYUUJtFoWvFmuK\nkTDI8c6qC4cC1Tj5TLpy8TpIJXmbR5abGqOVQ3OCN7pkFf29FlT5yr9LMkRTjrGn\nr9q0pWkDLgTA8jDQljRrsl0Z5+RPc00Lp7GcXVQSCMMDBAwAQlOC9fxlv+fIvsMp\nfiroQ0QdXw7n0gdtBiJ2CKM2dmjEMva3o0axvfYwqDPACBzilECbAlhS5HEPuqRt\nUm+bi3vSxnPq/aUKDv51oUeP4wrMhmzNhojvlJjz5LnBovW8ig+dpFLtq/+QDltw\nv3YyNwSbAgMBAAECggEAOBr+rB80v2Rjr2txYYqS324Ty7VHsR4HJ+EjRCXU1PTK\nKenbG7ZKiF6XTZlEmlhhMW+y4y5O1BYmekfvBMsYeATgZkYi+5yGXMWmO3WwtDAn\nC/UCMTgMZUFJq8c3g+ogOSMsZ1Xhb4prvb2vI1MYHPe2EtzmWgDs3N7m9MG9m4JS\nmtMdVXsnJteV4Md/aVdxoG3dk4SdT4/QPnfr+b10kJ2RTWZD8CWaYBmf1P1jyrhp\nltP5fBXPabhhc3vopydWBuaHX2/8St2TT05QHLPNr4Y4NWXJ6DzrH+Jg0L/6ESYS\npkKwPbgd25DHpdtQKFLULGP2U2klb9NV0M4cESxqgQKBgQDrChGJRu8xJ9Q7Dc31\neLjH2N2zsCrBhNCDkR5c1+4nKHE9THWSWVOjn5ygUdKSlshceDf1TLAlJ29K2K0c\nUO9Qj8VF8H+PsxjmsaHI3etFFmH/e9OkUCpaWjMpxZkfDUnKZGjex2r8S5sKKN0u\n/6aL8iS6NBZqd4KU9aKugd6PQwKBgQDWlBt6LyC2lYLQQ9Bdn3lf4kiXsiaj2VAF\nPhBvyHCRoExFHKEFLJW2LEkePCID7uwibtsg5K35bE+wq0J5x01pbe7bqDDtSIaN\nmr+xO8L3KBf6CSSGn68L9J63lrRuFz0Fb/SlbtLgT2zde4s1L6AUFdMsbhjq5DG4\nKMLYKH5DyQKBgB/6xboM6byhc7H5Rd2xaErgygGJ5bdg79IG67+sLZ4sVYQGpDSe\nbM/lhrUVjPYfB/H09YAtyAW2IOFpK9yfcoBen3PNrj2KG8g/wQiIkVtcGUdevMQt\nmCWlAjMbzKK59yFPmik9ruPXEahHORkM9ccy0iZ3sdkYm67S4SinSPXrAoGAHZeD\nSpBhRIzN44bWn3K0vGJqfHEXHxWDEZYDkkbkL1EZ85YFJr+FTgBBfSfx0PUMH5uG\nIL0ouPMU8lpL6ptvs5BzlltVlAOierjSotCJDKi81cCZBu/SpiVwFgV0kJIn2i4c\nYQwtjL2nV8wH4KfWva5c1w2/5fTeXnVQmZrL/vECgYEAn07rtfi5r8LjVITzrWEw\n+ykq6drT2c4XNlFU2qE1obz5vagd7Fa70fRXyGZyHl0TBPtpoGb1LHPvna46JD1a\n/AcpiBAnP13eAwSHINZrIDYofpD4cv9bReOrofiIFM/kS6cd59qm4SzMglQheQxf\nfq8bAP72uASomwCQL9Vls4M=\n-----END PRIVATE KEY-----\n",
                "client_email": "jupyter-demo@reusing-intent.iam.gserviceaccount.com",
                "client_id": "110070257040679077272",
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token",
                "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
                "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/jupyter-demo%40reusing-intent.iam.gserviceaccount.com",
            }
        )
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
