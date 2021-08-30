import json
from typing import Dict

import pandas as pd

from .Node import Node, NodeId


class Graph(object):
    def __init__(self, current, root, nodes, target=None):
        self.current = current
        self.root = root
        self.nodes: Dict[NodeId, Node] = {}
        self.target = target

        for k, v in nodes.items():
            n = Node(**v)
            n.setNode(v)
            self.nodes[k] = n

        for node in self.nodes.values():
            node.infer(self.nodes)

    def states(self, target: pd.DataFrame):
        nodes = {}

        for k, v in self.nodes.items():
            nodes[k] = v.state(target)

        return nodes

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
