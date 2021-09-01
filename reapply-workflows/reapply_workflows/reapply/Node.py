import json
from copy import deepcopy
from typing import Dict, List

import pandas as pd
from reapply_workflows.inference.interaction import (
    Aggregate,
    AlgorithmicSelection,
    Categorize,
    Filter,
    Interactions,
    Label,
    PCPSpec,
    PointSelection,
    RangeSelection,
    ScatterplotSpec,
)
from reapply_workflows.reapply.state import State

NodeId = str


class Node(object):
    def __init__(
        self,
        id,
        label,
        metadata,
        state,
        children=[],
        parent="",
        artifacts=None,
        **kwargs
    ):
        self.id = id
        self.label = label
        self.metadata = metadata
        self.interactions = Interactions(state["interactions"])
        self.children_ids = children
        self.parent_id = parent
        self.artifacts = artifacts
        self.record = None
        self.processed_state = None

    def setNode(self, node):
        self.node = node

    def infer(self, nodes: Dict[NodeId, "Node"]):
        if self.parent_id in nodes.keys():
            self.parent = nodes[self.parent_id]
        else:
            self.parent = None

        self.children = []

        for id in self.children_ids:
            if id in nodes.keys():
                self.children.append(nodes[id])

    def _state(self, target: pd.DataFrame, ignore_processed):
        if not ignore_processed:
            if self.processed_state:
                return self.processed_state

        if len(self.interactions.order) == 0:
            return State(target)

        if self.parent is None:
            self.processed_state = State(target)
            return self.processed_state

        state = self.parent.state(target, ignore_processed)

        interaction = self.interactions.latest

        if isinstance(interaction, ScatterplotSpec):
            if interaction.action == "Add":
                state.add_scatterplot_view(interaction)
            else:
                state.remove_scatterplot_view(interaction)
        elif isinstance(interaction, PCPSpec):
            state.add_pcp_view(interaction)
        elif isinstance(interaction, PointSelection):
            state.add_point_selection(interaction)
        elif isinstance(interaction, RangeSelection):
            state.add_range_selection(interaction)
        elif isinstance(interaction, AlgorithmicSelection):
            state.apply_intent(interaction)
        elif isinstance(interaction, Filter):
            state.apply_filter(interaction)
        elif isinstance(interaction, Label):
            state.apply_label(interaction)
        elif isinstance(interaction, Aggregate):
            state.apply_aggregate(interaction)
        elif isinstance(interaction, Categorize):
            state.apply_category(interaction)
        else:
            print("Unplanned", interaction)

        self.processed_state = state

        return self.processed_state

    def state(self, target: pd.DataFrame, ignore_processed=False):
        return deepcopy(self._state(target, ignore_processed))

    def compare(self, base: pd.DataFrame, target: pd.DataFrame):
        b_state = self.state(base, True)
        t_state = self.state(target, True)
        final_state = State(base)

        added: List[str] = []
        removed: List[str] = []
        updated: List[str] = []

        if self.parent is None:
            pass
        else:
            interaction = self.interactions.latest
            final_state.views = b_state.views
            if isinstance(interaction, ScatterplotSpec):
                added = target[~target.id.isin(base.id)].id.tolist()
                removed = base[~base.id.isin(target.id)].id.tolist()
                combined = pd.merge(
                    base, target, how="outer", left_on="id", right_on="id"
                )
                updated = (
                    combined[combined.iid_x != combined.iid_y].dropna().id.tolist()
                )

        print(len(added), len(removed), len(updated))

        return {
            "state": json.loads(
                json.dumps(final_state.toJSON(), default=lambda x: x.toJSON())
            ),
            "changes": {"added": added, "removed": removed, "updated": updated},
        }
