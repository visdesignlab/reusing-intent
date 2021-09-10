import json
from typing import Dict

import pandas as pd
from asciitree import BoxStyle, LeftAligned
from reapply_workflows.reapply.results import Result, Results

from .Node import Node, NodeId


def iterate(nodes: Dict[str, Node], id: str, tree={}):
    node = nodes[id]
    if node.id not in tree:
        tree[node.id] = {}
    for child in node.children_ids:
        iterate(nodes, child, tree[node.id])


class Graph(object):
    def __init__(self, current, root, nodes):
        self.current = current
        self.root = root
        self.nodes: Dict[NodeId, Node] = {}

        for k, v in nodes.items():
            n = Node(**v)
            n.setNode(v)
            self.nodes[k] = n

        for node in self.nodes.values():
            node.infer(self.nodes)

    def ascii_graph(self):
        tree = {}
        iterate(self.nodes, self.root, tree)
        tr = LeftAligned(
            draw=BoxStyle(
                node_label=lambda x: f"| {self.nodes[x].label}", label_space=0
            )
        )
        return tr(tree)

    def states(self, target: pd.DataFrame):
        nodes = {}

        for k, v in self.nodes.items():
            nodes[k] = v.state(target)

        return nodes

    def apply(self, target: pd.DataFrame, tid: str):
        record = {}

        for k, v in self.nodes.items():
            record[k] = Result(v, v.apply(target))

        order = []
        current = self.root

        while True:
            order.append(current)

            c_node = self.nodes[current]
            if len(c_node.children_ids) == 0:
                break

            current = c_node.children_ids[0]

        return Results(record, self.current, order, tid)

    def compare(self, base: pd.DataFrame, updated: pd.DataFrame):
        nodes = {}

        for node_id, node in self.nodes.items():
            compare = node.compare(base, updated)
            nodes[node_id] = compare

        data = base.copy(deep=True)

        not_in_base = updated[~updated.iid.isin(base.iid.tolist())]

        data = data.append(not_in_base)

        data = data.to_json(orient="records")
        data = json.loads(data)

        return {"data": data, "compare": nodes}
