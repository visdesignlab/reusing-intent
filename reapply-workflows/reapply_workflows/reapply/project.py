from typing import Any, Dict, List

from reapply_workflows.reapply.workflow import Workflow


class Project:
    def __init__(self, workflows: List[Any]):
        self.workflows: Dict[str, Workflow] = {}
        for wf in workflows:
            w = Workflow(**wf)
            self.workflows[w.id] = w

    def list_workflows(self):
        for wf in self.workflows.values():
            print(wf.name, "-", wf.id)

    def get_workflow(self, wf_id):
        if wf_id not in self.workflows:
            raise Exception("Workflow does not exist")
        return self.workflows[wf_id]
