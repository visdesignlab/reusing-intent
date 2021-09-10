from typing import Dict, List

import pandas as pd
from reapply_workflows.reapply.Node import Node


class Result:
    def __init__(self, node: Node, data: pd.DataFrame):
        self.node = node
        self.data = data

    def preview(self):
        return self.data

    def get_approve_status(self, tid: str):
        return tid

    def final(self) -> pd.DataFrame:
        data = self.data.copy(deep=True)

        columns = data.columns
        toDrop = ["id", "iid"]

        if "isFiltered" in columns:
            toDrop.append("isFiltered")
            data = data[~data.isFiltered]

        data = data.drop(toDrop, axis=1).reset_index(drop=True)

        return data  # type: ignore


class Results:
    def __init__(
        self, record: Dict[str, Result], current: str, order: List[str], tid: str
    ):
        self.results: Dict[str, Result] = record
        self.current = current
        self.order = order
        self.tid = tid

    def output(self, preview=False):
        if preview:
            return self.results[self.current].preview()
        return self.results[self.current].final()

    def pretty_print(self, print_fn=None):
        if print_fn is None:
            print_fn = print
        for n_id in self.order:
            res = self.results[n_id]
            print(res.node.label)
            print_fn(res.preview())

    def get(self, n_id: str, preview=False):
        res = self.results[n_id]
        if preview:
            return res.preview()
        else:
            return res.final()
