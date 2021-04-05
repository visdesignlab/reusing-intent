from typing import Dict

import pandas as pd
from asciitree import BoxStyle, LeftAligned

from backend.inference_core.reapply.data_structures.Provenance.node import Node, NodeId


def iterate(nodes: Dict[str, Node], id: str, tree={}):
    node = nodes[id]
    if node.id not in tree:
        tree[node.id] = {}
    for child in node.children_ids:
        iterate(nodes, child, tree[node.id])


class Graph(object):
    def __init__(self, current, root, nodes, target, target_id):
        self.target: pd.DataFrame = target
        self.target_id = target_id

        self.current: NodeId = current
        self.root: NodeId = root

        self.nodes: Dict[NodeId, Node] = {}

        for k, v in nodes.items():
            n = Node(target=self.target, target_id=target_id, **v)
            n.setNode(v)
            self.nodes[k] = n

        for node in self.nodes.values():
            node.infer(self.nodes)

        self.print_graph()

    def print_graph(self):
        tree = {}
        iterate(self.nodes, self.root, tree)
        tr = LeftAligned(
            draw=BoxStyle(
                node_label=lambda x: f"| {self.nodes[x].label}", label_space=0
            )
        )
        print(tr(tree))

    def apply(self):
        res = {}
        for k, v in self.nodes.items():
            res[k] = v.record.serialize()

        return res

    @property
    def isApprovedForAll(self):
        isApproved = True

        for v in self.nodes.values():
            if v.label == "Root":
                continue
            isApproved = isApproved and v.is_approved

        return isApproved

    @property
    def results(self):
        res = []
        order = []

        current = self.nodes[self.current]
        while current.label != "Root":
            order.append(current.id)
            current = self.nodes[current.parent_id]

        order = order[::-1]

        for k in order:
            v = self.nodes[k]
            result = {
                "data": v.record.apply(self.target),
                "interaction": v.label,
                "isApproved": v.is_approved,
            }
            res.append(result)

        return res

    def pretty_print(self):
        for v in self.results:
            print(
                v["interaction"],
                v["data"].shape,
                "---",
                "Approved" if v["isApproved"] else "Not Approved",
            )
            print(v["data"].head())
            print("------------------------------------")
            print()
