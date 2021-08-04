from abc import abstractmethod
from copy import deepcopy
from typing import Any, List


class BaseInteraction:
    @abstractmethod
    def apply(self, record):
        pass


class GenericInteraction(BaseInteraction):
    def __init__(self):
        self.type = "Generic"

    def apply(
        self,
        record,
    ):
        return deepcopy(record)


class ViewSpec(BaseInteraction):
    def __init__(self, id, type, **kwargs):
        self.id = id
        self.type = type

    def dimensions(self) -> List[str]:
        if isinstance(self, ScatterplotSpec):
            return [self.x, self.y]
        elif isinstance(self, PCPSpec):
            return self.dimensions
        return []

    def apply(
        self,
        record,
    ):
        r = deepcopy(record)
        r.add_update_view(self)
        return r


class ScatterplotSpec(ViewSpec):
    def __init__(self, id, type, action, x, y, **kwargs):
        self.id = id
        self.type = type
        self.action = action
        self.x = x
        self.y = y


class PCPSpec(ViewSpec):
    def __init__(self, id, type, action, dimensions, **kwargs):
        self.id = id
        self.type = type
        self.action = action
        self.dimensions: List[str] = dimensions


# ? Get brush extents here


class Selection(BaseInteraction):
    def __init__(self, type, spec, dimensions, **kwargs):
        self.type = type
        self.spec = ViewSpec(**spec)
        self.dimensions = dimensions

    def selections(self, data, freeform, brushSelections):
        if isinstance(self, PointSelection):
            freeform.extend(self.ids)
        elif isinstance(self, BrushSelection):
            if self.action == "Remove":
                del brushSelections[self.brushId]
            else:
                sels = []

                for k, v in self.extents.items():
                    d = data[(data[k] >= v[0]) & (data[k] <= v[1])]
                    sels.append(d["id"].tolist())

                sels = set(sels[0]).intersection(*sels)
                brushSelections[self.brushId] = list(sels)

        else:
            return [], {}
        return freeform, brushSelections

    def apply(
        self,
        record,
    ):
        pass


class PointSelection(Selection):
    def __init__(self, type, spec, dimensions, action, ids, **kwargs):
        self.type = type
        self.spec = ViewSpec(**spec)
        self.dimensions = dimensions
        self.action = action
        self.ids = ids

    def apply(self, record):
        r = deepcopy(record)
        r.add_point_selection(self)
        return r


class BrushSelection(Selection):
    def __init__(self, type, spec, dimensions, brushId, action, extents, **kwargs):
        self.type = type
        self.spec = ViewSpec(**spec)
        self.dimensions = dimensions
        self.action = action
        self.brushId = brushId
        self.extents = extents

    def apply(self, record):
        r = deepcopy(record)
        if self.action == "Add" or self.action == "Update":
            r.add_update_brush(self.__dict__)
        elif self.action == "Remove":
            r.remove_brush(self.__dict)
        return r


class IntentSelection(Selection):
    pass


class Filter:
    def __init__(self, action, **kwargs):
        self.action = action
        self.ids: List[str] = []

    def apply(self, record):
        r = deepcopy(record)
        r.apply_filter(self)
        return r


class Label:
    def __init__(self, **kwargs):
        self.as_: str = str(kwargs.get("as"))
        self.ids: List[str] = []

    def apply(self, record):
        r = deepcopy(record)
        r.apply_label(self)
        return r


class Categorize:
    def __init__(self, **kwargs):
        self.in_ = kwargs.get("in")
        self.as_ = kwargs.get("as")
        self.ids: List[str] = []

    def apply(self, record):
        r = deepcopy(record)
        r.apply_categorize(self)
        return r


class Aggregate:
    def __init__(self, id, by, **kwargs):
        self.id = id
        self.by = by
        self.ids: List[str] = []

    def apply(self, record):
        r = deepcopy(record)
        r.apply_aggregate(self)
        return r


class ReplaceAggregate:
    def __init__(self, id, drop, **kwargs):
        self.id = id
        self.drop = drop


def getInteraction(interaction) -> Any:
    i_type = interaction["i_type"]
    if i_type == "ViewSpec":
        vs = ViewSpec(**interaction)
        if vs.type == "Scatterplot":
            return ScatterplotSpec(**interaction)
        elif vs.type == "PCP":
            return PCPSpec(**interaction)
    elif i_type == "Selection":
        sel = Selection(**interaction)
        if sel.type == "Point":
            return PointSelection(**interaction)
        elif sel.type == "Brush":
            return BrushSelection(**interaction)
        elif sel.type == "Intent":
            return IntentSelection(**interaction)
    elif i_type == "Label":
        return Label(**interaction)
    elif i_type == "Filter":
        return Filter(**interaction)
    elif i_type == "Categorize":
        return Categorize(**interaction)
    elif i_type == "Aggregate":
        return Aggregate(**interaction)
    elif i_type == "ReplaceAggregate":
        return ReplaceAggregate(**interaction)
    return GenericInteraction()


class Interactions:
    def __init__(self, interactions):
        if type(interactions) is not list:
            raise Exception("Only accepts interactions")

        self.order = []

        for i in interactions:
            self.order.append(getInteraction(i))

    def inferSelectionsAndDimensions(self, data):
        dimensions: List[str] = []
        freeform = []
        brushSelections = {}

        for interaction in self.order:
            if isinstance(interaction, ViewSpec):
                dims = interaction.dimensions()
                dimensions.extend(dims)
            if isinstance(interaction, Selection):
                freeform, brushSelections = interaction.selections(
                    data, freeform, brushSelections
                )

        selections: List[str] = []
        selections.extend(freeform)

        for _, v in brushSelections.items():
            selections.extend(v)

        selections = list(set(selections))

        return dimensions, selections
