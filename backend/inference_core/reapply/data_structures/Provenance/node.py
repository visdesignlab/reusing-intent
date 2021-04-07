from copy import deepcopy
from typing import Dict, Optional

import pandas as pd

from backend.inference_core.reapply.data_structures.Provenance.state import State
from backend.inference_core.reapply.data_structures.record import Record
from backend.inference_core.reapply.data_structures.types import (
    BrushAction,
    InteractionType,
)

NodeId = str


class Node(object):
    def __init__(
        self,
        id,
        label,
        metadata,
        state,
        target: pd.DataFrame,
        target_id: str,
        children=[],
        parent="",
        artifacts=None,
        **kwargs
    ):
        eventType = metadata["eventType"]
        self.target = target
        self.target_id = target_id
        self.id = id
        self.label = label
        self.eventType = eventType
        self.children_ids = children
        self.parent_id = parent
        self._artifacts = artifacts
        self.state = State(**state)
        self.node = None
        self.processed_record: Optional[Record] = None

    def infer(self, nodes: Dict[str, "Node"]):
        if self.parent_id in nodes.keys():
            self.parent = nodes[self.parent_id]
        else:
            self.parent = None
        self.children = []
        for id in self.children_ids:
            if id in nodes.keys():
                self.children.append(nodes[id])

    def setNode(self, node):
        self.node = node

    @property
    def record(self):
        if self.processed_record is None:
            self.process()
        assert self.processed_record is not None
        return deepcopy(self.processed_record)

    def process(self):
        int_type = self.interaction_type
        if int_type == InteractionType.ROOT:
            self.processed_record = Record()
            return

        record = self.parent.record

        if not self.should_apply:
            self.processed_record = record
            return

        if int_type == InteractionType.ADD_PLOT:
            interaction = self.state.add_plot_interaction
            record.update_plot(interaction.plot)
        elif int_type == InteractionType.REMOVE_PLOT:
            interaction = self.state.remove_plot_interaction
            record.remove_plot(interaction.plotId)
        elif int_type == InteractionType.POINT_SELECTION:
            interaction = self.state.point_selection_interaction
            record.add_point_selection(interaction.plot, interaction.selected)
        elif int_type == InteractionType.BRUSH:
            interaction = self.state.brush_interaction
            action = interaction.action
            if action == BrushAction.ADD:
                record.add_brush(interaction.plot, interaction.brush, self.target)
            elif action == BrushAction.UPDATE:
                record.update_brush(interaction.plot, interaction.brush, self.target)
            elif action == BrushAction.REMOVE:
                record.remove_brush(interaction.plot, interaction.brush_id)
        elif int_type == InteractionType.SELECT_PREDICTION:
            interaction = self.state.select_prediction_interaction
            record.set_prediction(interaction.prediction, self.target, self.target_id)
        elif int_type == InteractionType.FILTER:
            interaction = self.state.filter_interaction
            record.set_filter(interaction.filterType)

        self.processed_record = record

    @property
    def interaction(self):
        return self.state.interaction

    @property
    def interaction_type(self):
        return self.interaction.type

    @property
    def artifact(self):
        if self._artifacts is None or "customArtifacts" not in self._artifacts:
            return None
        arts = self._artifacts["customArtifacts"]

        if len(arts) == 0:
            return None

        art = arts[-1]["artifact"]

        return art

    @property
    def should_apply(self):
        if self.target_id == self.artifact["original_dataset"]:
            return True
        return self.artifact["status_record"][self.target_id] != "Rejected"

    @property
    def is_approved(self):
        if self.target_id == self.artifact["original_dataset"]:
            return True
        return self.artifact["status_record"][self.target_id] == "Accepted"

    def serialize(self):
        ser = self.node
        ser["state"] = self.state.__dict__
        return ser
