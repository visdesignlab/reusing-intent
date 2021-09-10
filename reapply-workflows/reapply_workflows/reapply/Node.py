import json
from copy import deepcopy
from typing import Dict, List

import pandas as pd
from reapply_workflows.compute.changes import (
    Change,
    get_changes_df,
    get_changes_point_selection,
    get_changes_selections,
)
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
    Selection,
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
        **kwargs,
    ):
        self.id = id
        self.label = label
        self.metadata = metadata
        self.interactions = Interactions(state["interaction"])
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

        if self.parent is None:
            self.processed_state = State(target)
            return self.processed_state

        state = self.parent.state(target, ignore_processed)

        interaction = self.interactions.interaction

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

    def apply(self, target: pd.DataFrame):
        target = target.copy(deep=True)
        state = self.state(target, ignore_processed=True)
        selections = state.selections
        filtered = state.filteredPoints
        labels = state.labels
        categories = state.categoryAssignments
        aggregates = state.aggregates

        if len(selections) > 0:
            target["isSelected"] = False
            target["isSelected"] = target.id.isin(selections)
        if len(filtered) > 0:
            target["isFiltered"] = False
            target["isFiltered"] = target.id.isin(filtered)
        if len(labels) > 0:
            for k, v in labels.items():
                lab = f"label_{k.strip()}"
                target[lab] = False
                target[lab] = target.id.isin(v)
        if len(categories) > 0:
            for category, assignments in categories.items():
                target[category] = "Unassigned"
                for option, values in assignments.items():
                    target.loc[target.id.isin(values), category] = option.strip()  # type: ignore   # noqa
        if len(aggregates) > 0:
            for agg_id, record in aggregates.items():
                target = target.append(record.aggregate, ignore_index=True)  # type: ignore # noqa

        return target

    def compare(self, base: pd.DataFrame, target: pd.DataFrame):
        b_state = self.state(base, True)
        t_state = self.state(target, True)
        final_state = State(base)

        change: Change = Change()

        if self.parent is None:
            pass
        else:
            interaction = self.interactions.interaction
            final_state.views = b_state.views
            if isinstance(interaction, ScatterplotSpec):
                change = get_changes_df(base, target)
            elif isinstance(interaction, Selection):
                b_selections: List[str] = []
                t_selections: List[str] = []
                if isinstance(interaction, RangeSelection):
                    if interaction.action == "Remove":
                        change = Change()
                    else:
                        b_selections = b_state.views[interaction.view].brushSelections[
                            interaction.rangeId
                        ]
                        t_selections = t_state.views[interaction.view].brushSelections[
                            interaction.rangeId
                        ]

                        change = get_changes_selections(
                            base,
                            target,
                            b_selections,
                            t_selections,
                        )
                elif isinstance(interaction, PointSelection):
                    ids = interaction.ids
                    change = get_changes_point_selection(
                        base[base.id.isin(ids)], target[target.id.isin(ids)], []
                    )
                elif isinstance(interaction, AlgorithmicSelection):
                    b_selections = b_state.freeformSelections
                    t_selections = t_state.freeformSelections
                    change = get_changes_selections(
                        base, target, b_selections, t_selections
                    )

        return {
            "state": json.loads(
                json.dumps(final_state.toJSON(), default=lambda x: x.toJSON())
            ),
            "changes": change.toJSON(),
        }
