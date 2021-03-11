class State(object):
    def __init__(
        self,
        showCategories,
        categoryColumn,
        multiBrushBehaviour,
        plots,
        brushType,
        selectedPrediction,
        filterList,
    ):
        self.showCategories = showCategories
        self.categoryColumn = categoryColumn
        self.multiBrushBehaviour = multiBrushBehaviour
        self.plots = plots
        self.brushType = brushType
        self.selectedPrediction = selectedPrediction
        self.filterList = filterList
