from typing import Any, Dict, List

import pandas as pd

from backend.inference_core.reapply.data_structures.brush_interaction import (
    BrushInteraction,
)
from backend.inference_core.reapply.data_structures.filter_interaction import (
    FilterInteraction,
)
from backend.inference_core.reapply.data_structures.plot_interaction import (
    AddPlotInteraction,
)
from backend.inference_core.reapply.data_structures.point_selection_interaction import (
    PointSelectionInteraction,
)
from backend.inference_core.reapply.data_structures.Provenance.node import Node, NodeId
from backend.inference_core.reapply.data_structures.record import Record
from backend.inference_core.reapply.data_structures.select_prediction_interaction import (
    SelectPredictionInteraction,
)
from backend.inference_core.reapply.data_structures.types import (
    BrushAction,
    InteractionType,
)


class Graph(object):
    def __init__(self, current, root, nodes, target, target_id):
        self.target: pd.DataFrame = target
        self.target_id = target_id
        self.current: NodeId = current
        self.root: NodeId = root
        self.rawNodes = nodes

        self.nodes: Dict[NodeId, Node] = {}
        self.paths = []

        for k, v in nodes.items():
            n = Node(**v)
            n.setNode(v)
            self.nodes[k] = n

        self.inferPaths()

    def inferPaths(self):
        leaves = []
        for k, v in self.nodes.items():
            if len(v.children) == 0:
                leaves.append(k)

        paths = []
        for leaf in leaves:
            path = []
            curr = self.nodes[leaf]
            while True:
                path.append(curr.id)

                if curr.parent is None:
                    break

                curr = self.nodes[curr.parent]
            path = path[::-1]
            paths.append(path)

        self.paths = paths

    @property
    def mainBranch(self):
        for path in self.paths:
            if self.current in path:
                return path
        return None

    def applyPath(self, path: List[str], records={}):

        for node_id in path:
            node = self.nodes[node_id]
            interaction = node.state.interaction

            if node_id in records:
                continue

            parentRecord = Record()
            if node.parent in records:
                parentRecord = records[node.parent]

            rec = None
            if interaction.type == InteractionType.ADD_PLOT:
                interaction = AddPlotInteraction(**interaction.raw)
                rec = parentRecord.update_plot(interaction.plot)
            elif interaction.type == InteractionType.POINT_SELECTION:
                interaction = PointSelectionInteraction(**interaction.raw)
                rec = parentRecord.add_point_selection(
                    interaction.plot, interaction.selected
                )
            elif interaction.type == InteractionType.BRUSH:
                interaction = BrushInteraction(**interaction.raw)
                if interaction.action == BrushAction.ADD:
                    rec = parentRecord.add_brush(
                        interaction.plot, interaction.brush, self.target
                    )
                elif interaction.action == BrushAction.UPDATE:
                    rec = parentRecord.update_brush(
                        interaction.plot, interaction.brush, self.target
                    )
                elif interaction.action == BrushAction.REMOVE:
                    rec = parentRecord.remove_brush(
                        interaction.plot, interaction.brush_id
                    )
            elif interaction.type == InteractionType.SELECT_PREDICTION:
                interaction = SelectPredictionInteraction(**interaction.raw)
                rec = parentRecord.set_prediction(
                    interaction.prediction, self.target, self.target_id
                )
            elif interaction.type == InteractionType.FILTER:
                interaction = FilterInteraction(**interaction.raw)
                rec = parentRecord.set_filter(interaction.filterType, self.target)

            if rec is not None:
                records[node_id] = rec

        return records

    def apply(self):
        stateRecord: Dict[str, Any] = {}

        for path in self.paths:
            stateRecord = self.applyPath(path, stateRecord)

        rec = {}

        for k, v in stateRecord.items():
            rec[k] = v.serialize()

        return rec
