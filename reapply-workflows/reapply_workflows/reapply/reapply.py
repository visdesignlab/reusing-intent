import pandas as pd


class Project:
    def __init__(self, name, status_record):
        self.name = name
        self.status_record = status_record


class Workflow:
    def __init__(self, name, graph, project):
        self.name = name
        self.graph = graph
        self.project = Project(**project)


class Reapply:
    def apply(self, dataframe: pd.DataFrame):
        pass
