from backend.inference_core.reapply.data_structures.brush import BrushCollection


class Plot(object):
    def __init__(self, id, x, y, brushes, **kwargs):
        self.id: str = id
        self.x_col: str = x
        self.y_col: str = y
        self.brushes: BrushCollection = BrushCollection(brushes)

    @property
    def dimensions(self):
        return [self.x_col, self.y_col]

    def get_brush_by_id(self, id):
        return self.brushes.get_brush(id)
