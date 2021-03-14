from typing import Dict


class Extent(object):
    def __init__(self, x1, x2, y1, y2, **kwargs):
        self.x1: float = x1
        self.x2: float = x2
        self.y1: float = y1
        self.y2: float = y2

    def serialize(self):
        return {"x1": self.x1, "x2": self.x2, "y1": self.y1, "y2": self.y2}


class Brush(object):
    def __init__(self, id, extents, **kwargs):
        self.id: str = id
        self.extents: Extent = Extent(**extents)

    def get_brush_mask(self, data):
        return (
            (data[:, 0] >= self.extents.x1)
            & (data[:, 0] <= self.extents.x2)
            & (data[:, 1] >= self.extents.y1)
            & (data[:, 1] <= self.extents.y2),
        )[0]

    def serialize(self):
        return {"id": self.id, "extents": self.extents.serialize()}


class BrushCollection:
    def __init__(self):
        self.collection: Dict[str, Brush] = {}

    def add_brush(self, brush):
        self.collection[brush.id] = brush

    def remove_brush(self, brush):
        del self.collection[brush]

    def get_brush(self, id: str) -> Brush:
        return self.collection[id]

    def to_list(self):
        return self.collection.values()

    @property
    def isEmpty(self):
        return len(self.collection.keys()) == 0

    def serialize(self):
        brushes = {}
        for k, v in self.collection.items():
            brushes[k] = v.serialize()
        return brushes
