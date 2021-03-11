from copy import deepcopy
from typing import Dict

import pandas as pd

from backend.inference_core.reapply.data_structures.interactions import Interactions
from backend.inference_core.reapply.data_structures.Provenance.node import Node, NodeId


class Graph(object):
    def __init__(self, current, root, nodes):
        self.order = []
        self.current: NodeId = current
        self.root: NodeId = root
        self.rawNodes = nodes
        self.nodes: Dict[NodeId, Node] = {}
        for k, v in nodes.items():
            n = Node(**v)
            n.setNode(v)
            self.nodes[k] = n

        curr = self.nodes[self.current]

        while True:
            self.order.append(curr.id)

            if curr.parent is None:
                break

            curr = self.nodes[curr.parent]

        self.order = self.order[::-1]

    def iterate(self, func):
        res = []
        for k in self.order:
            res.append(func(self.nodes[k]))
        return res

    @property
    def interactions(self):
        interactions = self.iterate(lambda x: x.artifact)
        interactions = list(filter(lambda x: x, interactions))
        return Interactions(interactions)

    @property
    def latestState(self):
        currentState = self.nodes[self.current].state
        currentState = deepcopy(currentState)
        return currentState

    def apply(self, base: pd.DataFrame, target: pd.DataFrame):
        changes = self.interactions.reapply_interaction(base, target)

        nodes = {}
        for k, v in self.nodes.items():
            if k not in self.order:
                continue
            if "brush" in v.label.lower():
                rec = changes[k]

                v.node["state"]["plots"][rec["plot_id"]]["brushes"][rec["brush_id"]][
                    "points"
                ] = rec["result"]
                # v.node['state']['plots'][]
            elif "selection" in v.label.lower():
                rec = changes[k]
                v.node["state"]["selectedPrediction"]["memberIds"] = rec["result"]
            elif "filter" in v.label.lower():
                rec = changes[k]
                v.node["state"]["filterList"] = rec["result"]
            else:
                print(v.label)
            nodes[k] = v.serialize()

        return {"current": self.current, "root": self.root, "nodes": nodes}
