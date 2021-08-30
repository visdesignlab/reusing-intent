from copy import deepcopy
from typing import Dict, List

import numpy as np
import pandas as pd

from ..inference.interaction import (
    Aggregate,
    Categorize,
    Filter,
    Label,
    PointSelection,
    ViewSpec,
)


class Extent:
    def __init__(self, dim: str, _min: float, _max: float):
        self.dim = dim
        self.min = _min
        self.max = _max


class Brush:
    def __init__(self, brushId, spec, action, dimensions, extents, **kwargs):
        self.id = brushId
        self.spec = spec
        self.action = action
        self.dimensions = dimensions
        self.extents: List[Extent] = []
        for k, v in extents.items():
            self.extents.append(Extent(k, v[0], v[1]))
        self.selected_points: List[str] = []

    def apply(self, data: pd.DataFrame):
        mask = self.get_mask(data)
        self.selected_points = data[mask].id.tolist()

    def get_mask(self, data: pd.DataFrame):
        masks = []
        for extent in self.extents:
            m = (data[extent.dim] >= extent.min) & (data[extent.dim] <= extent.max)
            masks.append(m)
        return np.logical_and(*masks)


class BrushCollection:
    def __init__(self):
        self.collection: Dict[str, Brush] = {}

    def add_update(self, brush: Brush):
        self.collection[brush.id] = brush

    def remove(self, brush: Brush):
        del self.collection[brush.id]


class Record:
    def __init__(self, data: pd.DataFrame):
        self.data = data
        self.views: Dict[str, ViewSpec] = {}
        self.brushes: Dict[str, BrushCollection] = {}
        self.brushSelections: Dict[str, List[str]] = {}
        self.pointSelections: Dict[str, List[PointSelection]] = {}
        self.filter: List[Filter] = []
        self.label: List[Label] = []
        self.categorize: List[Categorize] = []
        self.aggregate: List[Aggregate] = []

    def add_update_view(self, view: ViewSpec):
        self.views[view.id] = view

    def remove_view(self, view: ViewSpec):
        id = view.id
        if id in self.views:
            del self.views[id]
        if id in self.brushes:
            del self.brushes[id]
        if id in self.pointSelections:
            del self.pointSelections[id]

    def add_point_selection(self, sel: PointSelection):
        pass
        # view_id = sel.spec.id
        # if view_id not in self.pointSelections:
        #     self.pointSelections[view_id] = []
        # self.pointSelections[view_id].append(sel)

    def add_update_brush(self, _brush):
        brush = Brush(**_brush)
        view_id = brush.spec.id
        if view_id not in self.brushes:
            self.brushes[view_id] = BrushCollection()
        brush.apply(self.data)
        self.brushes[view_id].add_update(brush)

    def remove_brush(self, _brush):
        brush = Brush(**_brush)
        self.brushes[brush.spec.id].remove(brush)

    @property
    def selections(self):
        sels: List[str] = []

        for psl in self.pointSelections.values():
            for ps in psl:
                sels.extend(ps.ids)

        for bcol in self.brushes.values():
            for brs in bcol.collection.values():
                sels.extend(brs.selected_points)

        return list(set(sels))

    def clear_selections(self):
        self.brushes = {}
        self.pointSelections = {}

    def apply_filter(self, filter: Filter):
        filter.ids = self.selections
        self.filter.append(filter)
        self.clear_selections()

    def apply_label(self, label: Label):
        label.ids = self.selections
        self.label.append(label)
        self.clear_selections()

    def apply_categorize(self, categorize: Categorize):
        categorize.ids = self.selections
        self.categorize.append(categorize)
        self.clear_selections()

    def apply_aggregate(self, agg: Aggregate):
        agg.ids = self.selections
        self.aggregate.append(agg)
        self.clear_selections()

    @property
    def df(self):
        data = deepcopy(self.data)
        return data
        # if len(self.aggregate) > 0:
        #     d = deepcopy(data)
        #     cols = d.columns
        #     rows = []
        #     for agg in self.aggregate:
        #         data[agg.id] = False
        #         data.loc[data.id.isin(agg.ids), "_agg"] = True
        #         a_row = None

        #         label = f"{agg.id} ({agg.by})"

        #         if agg.by == "Mean":
        #             a_row = (
        #                 data.groupby(agg.id, as_index=False)
        #                 .mean()
        #                 .assign(id=label, iid=label)
        #             )
        #         elif agg.by == "Median":
        #             a_row = (
        #                 data.groupby(agg.id, as_index=False)
        #                 .median()
        #                 .assign(id=label, iid=label)
        #             )
        #         elif agg.by == "Sum":
        #             a_row = (
        #                 data.groupby(agg.id, as_index=False)
        #                 .sum()
        #                 .assign(id=label, iid=label)
        #             )
        #         elif agg.by == "Min":
        #             a_row = (
        #                 data.groupby(agg.id, as_index=False)
        #                 .min()
        #                 .assign(id=label, iid=label)
        #             )
        #         elif agg.by == "Max":
        #             a_row = (
        #                 data.groupby(agg.id, as_index=False)
        #                 .max()
        #                 .assign(id=label, iid=label)
        #             )
        #         if a_row is not None:
        #             rows.append([a_row, label])

        #     for r, id in rows:
        #         d = pd.concat([d, r])
        #         d.fillna(id, inplace=True)

        #     data = d[cols]

        # if len(self.label) > 0:
        #     data["Labels"] = "Unassigned"
        #     for label in self.label:
        #         data.loc[data.id.isin(label.ids), "Labels"] = label.as_

        # if len(self.filter) > 0:
        #     data["Filtered"] = False
        #     for fl in self.filter:
        #         if fl.action == "In":
        #             data.loc[~data.id.isin(fl.ids), "Filtered"] = True
        #         else:
        #             data.loc[data.id.isin(fl.ids), "Filtered"] = True

        # if len(self.categorize) > 0:
        #     for cat in self.categorize:
        #         if cat.in_ not in data.columns:
        #             data[cat.in_] = None
        #         data.loc[data.id.isin(cat.ids), cat.in_] = cat.as_

        # if len(self.selections) > 0:
        #     data["_Selections"] = False
        #     data.loc[data.id.isin(self.selections), "_Selections"] = True

        # return data
