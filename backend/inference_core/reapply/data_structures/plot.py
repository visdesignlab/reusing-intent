class Plot(object):
    def __init__(self, id, x, y, **kwargs):
        self.id: str = id
        self.x_col: str = x
        self.y_col: str = y

    @property
    def dimensions(self):
        return [self.x_col, self.y_col]

    def serialize(self):
        return {"id": self.id, "x": self.x_col, "y": self.y_col}
