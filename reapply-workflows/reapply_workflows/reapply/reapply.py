import firebase_admin
import requests
from firebase_admin import credentials, db
from reapply_workflows.reapply.project import Project

CRED_PATH = (
    "https://drive.google.com/uc?export=download&id=1IoGdcHbFIPNhNK26qxdHd8X1JC8tpKjm"
)


def get_credentials():
    r = requests.get(CRED_PATH).json()
    return credentials.Certificate(r)


def init_firebase():
    cred = get_credentials()
    try:
        firebase_admin.get_app()
    except:  # noqa
        firebase_admin.initialize_app(
            cred, {"databaseURL": "https://reusing-intent-default-rtdb.firebaseio.com/"}
        )


class Reapply:
    def __init__(self):
        # print("Initializing with", CRED_PATH)
        init_firebase()

    def load(self, name: str):
        ref = db.reference("/")
        all_workflows = ref.get()
        all_workflows = [all_workflows[k] for k in all_workflows]
        workflows = list(
            filter(
                lambda x: "type" in x
                and x["type"] == "Custom"
                and "project_name" in x
                and x["project_name"] == name,
                all_workflows,
            )
        )
        return Project(workflows)


# def apply(self, record: Record):
#     r = deepcopy(record)

#     return r
