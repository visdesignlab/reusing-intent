from typing import Any, Dict, List

import numpy as np
import pandas as pd
from reapply_workflows.inference.interaction import (
    Aggregate,
    AlgorithmicSelection,
    Filter,
    Label,
    PCPSpec,
    PointSelection,
    RangeSelection,
    ScatterplotSpec,
    ViewSpec,
)


class Brush:
    def __init__(self, id, dimensions, extents):
        self.id = id
        self.dimensions = dimensions
        self.exts = extents
        self.extents = {
            "x1": extents[dimensions[0]]["min"],
            "x2": extents[dimensions[0]]["max"],
            "y1": extents[dimensions[1]]["min"],
            "y2": extents[dimensions[1]]["max"],
        }

    def process_selection(self, data: pd.DataFrame):
        masks = []
        for d in self.dimensions:
            mask = (data[d] >= self.exts[d]["min"]) & (data[d] <= self.exts[d]["max"])
            masks.append(mask)

        mask = np.logical_and.reduce(masks)

        ids = data[mask].id

        return ids.tolist()

    def toJSON(self):
        return {"id": self.id, "extents": self.extents}


class BrushCollection:
    def __init__(self):
        self.collection: Dict[str, Brush] = {}

    def remove(self, brush: RangeSelection):
        del self.collection[brush.rangeId]

    def update(self, dimensions, brush: RangeSelection):
        if brush.action == "Remove":
            self.remove(brush)
        else:
            self.collection[brush.rangeId] = Brush(
                brush.rangeId, dimensions, brush.extents
            )

    def process_selections(self, data: pd.DataFrame):
        selections: Dict[str, List[str]] = {}
        for k, v in self.collection.items():
            selections[k] = v.process_selection(data)
        return selections

    def toJSON(self):
        return self.collection


class View:
    def __init__(self, spec: ViewSpec):
        self.id = spec.id
        self.spec = spec.__dict__
        self.brushSelections: Dict[str, List[str]] = {}
        self.brushes: BrushCollection = BrushCollection()
        self.dimensions = spec.dimensions

    @property
    def selections(self):
        sels: List[str] = []
        for s in self.brushSelections.values():
            sels.extend(s)

        return sels

    def clearSelection(self):
        self.brushSelections = {}
        self.brushes = BrushCollection()

    def update_brush(self, brush: RangeSelection, data: pd.DataFrame):
        self.brushes.update(self.dimensions, brush)
        self.brushSelections = self.brushes.process_selections(data)


class ScatterplotView(View):
    def __init__(self, spec: ScatterplotSpec):
        self.id = spec.id
        self.spec = spec.to_dict()
        self.brushSelections: Dict[str, List[str]] = {}
        self.brushes: BrushCollection = BrushCollection()
        self.dimensions = spec.dimensions
        self.type = "Scatterplot"
        self.x = spec.x
        self.y = spec.y

    def toJSON(self):
        return {
            "id": self.id,
            "spec": self.spec,
            "type": self.type,
            "x": self.x,
            "y": self.y,
            "brushSelections": self.brushSelections,
            "brushes": self.brushes,
        }


class PCPView(View):
    def __init__(self, spec: PCPSpec):
        self.id = spec.id
        self.spec = spec.to_dict()
        self.brushSelections: Dict[str, List[str]] = {}
        self.dimensions = spec.dimensions
        self.brushes: BrushCollection = BrushCollection()
        self.type = "Scatterplot"
        self.dimensions = spec.dimensions

    def toJSON(self):
        return {
            "id": self.id,
            "spec": self.spec,
            "type": self.type,
            "dimensions": self.dimensions,
            "brushSelections": self.brushSelections,
            "brushes": self.brushes,
        }


class AggregateRecord:
    def __init__(self, id, name: str, rules, drop: bool):
        self.id = id
        self.name = name
        self.map: Dict[str, str] = {}
        for k, v in rules.items():
            self.map[k] = v.lower()
        self.drop = drop
        self.values: List[str] = []
        self.aggregate = None

    def apply_aggregation(self, data: pd.DataFrame):
        # ? Do we need this?
        # self.values = data.id.tolist()
        columns = data.columns
        d: Any = data
        aggRow = d.aggregate(self.map, axis="rows").to_dict()
        output = {}

        for col in columns:
            if col == "id" or col == "iid":
                output[col] = self.id
            elif col in aggRow:
                output[col] = aggRow[col]
            else:
                output[col] = self.name

        self.aggregate = output

    def toJSON(self):
        return {
            "name": self.name,
            "aggregate": self.aggregate,
            "values": self.values,
        }


class State:
    def __init__(self, target: pd.DataFrame):
        self._target = target
        self.views: Dict[str, View] = {}
        self.freeformSelections: List[str] = []
        self.labels: Dict[str, List[str]] = {}
        self.filteredPoints: List[str] = []
        self.categoryAssignments: Dict[str, Dict[str, List[str]]] = {}
        self.aggregates: Dict[str, AggregateRecord] = {}

    @property
    def target(self) -> pd.DataFrame:
        df: Any = self._target[~self._target.id.isin(self.filteredPoints)]

        return df

    @property
    def selections(self) -> List[str]:
        sels = self.freeformSelections
        for v in self.views.values():
            sels.extend(v.selections)
        return list(set(sels))

    def clearSelections(self):
        self.freeformSelections = []
        for view in self.views.values():
            view.clearSelection()

    def add_scatterplot_view(self, spec: ScatterplotSpec):
        self.views[spec.id] = ScatterplotView(spec)

    def remove_scatterplot_view(self, spec: ScatterplotSpec):
        del self.views[spec.id]

    def add_pcp_view(self, spec: PCPSpec):
        self.views[spec.id] = PCPView(spec)

    def add_point_selection(self, selection: PointSelection):
        if selection.action == "Selection":
            self.freeformSelections.extend(selection.ids)
        else:
            self.freeformSelections = list(
                filter(lambda x: x not in selection.ids, self.freeformSelections)
            )
        self.freeformSelections = list(set(self.freeformSelections))

    def add_range_selection(self, selection: RangeSelection):
        view_id = selection.view
        self.views[view_id].update_brush(selection, self.target)

    def apply_intent(self, alg: AlgorithmicSelection):
        self.clearSelections()
        ids = alg.intent.apply(self.target)
        sels = self.freeformSelections
        sels.extend(ids)
        self.freeformSelections = list(set(sels))

    def apply_filter(self, filter: Filter):
        selectedPoints = self.selections

        toFilter: List[str] = []

        if filter.action == "In":
            toFilter = self.target[~self.target.id.isin(selectedPoints)].id.tolist()
        else:
            toFilter = self.target[self.target.id.isin(selectedPoints)].id.tolist()

        self.filteredPoints.extend(toFilter)
        self.filteredPoints = list(set(self.filteredPoints))
        self.clearSelections()

    def apply_label(self, label: Label):
        to_label = self.selections
        prev_labels = []
        if label.as_ in self.labels:
            prev_labels = self.labels[label.as_]

        prev_labels.extend(to_label)
        self.labels[label.as_] = list(set(prev_labels))

        self.clearSelections()

    def apply_aggregate(self, agg: Aggregate):
        aggRecord = AggregateRecord(agg.id, agg.name, agg.rules, agg.drop)
        to_agg: Any = self.target[self.target.id.isin(self.selections)]
        aggRecord.apply_aggregation(to_agg)

        if aggRecord.drop:
            self.filteredPoints.extend(aggRecord.values)

        self.aggregates[agg.id] = aggRecord
        self.clearSelections()

    def toJSON(self):
        return {
            "views": self.views,
            "freeformSelections": self.freeformSelections,
            "labels": self.labels,
            "filteredPoints": self.filteredPoints,
            "categoryAssignments": self.categoryAssignments,
            "aggregates": self.aggregates,
            "selections": self.selections,
        }
