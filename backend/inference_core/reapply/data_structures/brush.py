from typing import Dict, List


class Extent(object):
    def __init__(self, x1, x2, y1, y2, **kwargs):
        self.x1: float = x1
        self.x2: float = x2
        self.y1: float = y1
        self.y2: float = y2


class Brush(object):
    def __init__(self, id, extents, points, **kwargs):
        self.id: str = id
        self.extents: Extent = Extent(**extents)
        self.points: List[str] = points

    def get_brush_mask(self, data):
        return (
            (data[:, 0] >= self.extents.x1)
            & (data[:, 0] <= self.extents.x2)
            & (data[:, 1] >= self.extents.y1)
            & (data[:, 1] <= self.extents.y2),
        )


class BrushCollection(object):
    def __init__(self, brushes, **kwargs):
        self.collection: Dict[str, Brush] = {}
        for k, v in brushes.items():
            self.collection[k] = Brush(**v)

    def get_brush(self, id: str) -> Brush:
        return self.collection[id]

    def to_list(self):
        return self.collection.values()
