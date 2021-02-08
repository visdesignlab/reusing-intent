from typing import Dict, List

import pandas as pd


def get_changes_df(base: pd.DataFrame, updated: pd.DataFrame):
    added = updated[~updated.id.isin(base.id)].id.tolist()

    removed = base[~base.id.isin(updated.id)].id.tolist()

    combined = pd.merge(base, updated, how="outer", left_on="id", right_on="id")
    changes = combined[combined.iid_x != combined.iid_y]
    changes = changes.dropna().id.tolist()

    return {"added": added, "removed": removed, "changed": changes}


def get_changes_point_selection(
    base: pd.DataFrame, updated: pd.DataFrame, selections: List[str]
):
    removed = base[~base.id.isin(updated.id) & base.id.isin(selections)].id.tolist()

    return {"added": [], "removed": removed, "changed": []}


def get_similarity(l1, l2):
    intersection = len(set(l1).intersection(set(l2)))
    union = len(set(l1)) + len(set(l2)) - intersection

    return intersection / union


def get_changes_brush(base, updated, plot, brushId):
    plot = Plot(**plot)

    brush = plot.brushes.get_brush(brushId)

    mask = brush.get_brush_mask(updated[plot.dimensions].values)
    ids = updated.loc[mask].id
    changes = get_changes_df(
        base[base.id.isin(brush.points)], updated[updated.id.isin(ids)]
    )
    changes["plot_id"] = plot.id
    changes["brush_id"] = brush.id
    return changes


class Extent:
    x1: float
    x2: float
    y1: float
    y2: float

    def __init__(self, x1, x2, y1, y2, **kwargs):
        self.x1 = x1
        self.x2 = x2
        self.y1 = y1
        self.y2 = y2


class Brush:
    id: str
    extents: Extent
    points: List[str]

    def __init__(self, id, extents, points, **kwargs):
        self.id = id
        self.extents = Extent(**extents)
        self.points = points

    def get_brush_mask(self, data):
        return (
            (data[:, 0] >= self.extents.x1)
            & (data[:, 0] <= self.extents.x2)
            & (data[:, 1] >= self.extents.y1)
            & (data[:, 1] <= self.extents.y2),
        )


class BrushCollection:
    collection: Dict[str, Brush]

    def __init__(self, brushes, **kwargs):
        self.collection = {}
        for k, v in brushes.items():
            self.collection[k] = Brush(**v)

    def get_brush(self, id: str) -> Brush:
        return self.collection[id]

    def to_list(self):
        return self.collection.values()


class Plot:
    id: str
    brushes: BrushCollection
    x_col: str
    y_col: str

    def __init__(self, id, x, y, brushes, **kwargs):
        self.id = id
        self.x_col = x
        self.y_col = y
        self.brushes = BrushCollection(brushes)

    @property
    def dimensions(self):
        return [self.x_col, self.y_col]
