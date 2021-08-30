from abc import abstractmethod
from copy import deepcopy
from typing import Any, List

from reapply_workflows.inference.intent import Intent


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
    def __init__(self, interaction):
        self.id = interaction["id"]
        self.type = interaction["type"]
        self.dimensions = interaction["dimensions"]
        self.__interaction__ = interaction

    def apply(
        self,
        record,
    ):
        r = deepcopy(record)
        r.add_update_view(self)
        return r

    def to_dict(self):
        return self.__interaction__


class ScatterplotSpec(ViewSpec):
    def __init__(self, interaction):
        self.id = interaction["id"]
        self.type = interaction["type"]
        self.action = interaction["action"]
        self.dimensions: List[str] = interaction["dimensions"]
        if len(self.dimensions) == 2:
            self.x = self.dimensions[0]
            self.y = self.dimensions[1]
        else:
            self.x = None
            self.y = None
        self.__interaction__ = interaction


class PCPSpec(ViewSpec):
    def __init__(self, interaction):
        self.id = interaction["id"]
        self.type = interaction["type"]
        self.action = interaction["action"]
        self.dimensions: List[str] = interaction["dimensions"]
        self.__interaction__ = interaction


# ? Get brush extents here


class Selection(BaseInteraction):
    def __init__(self, type, **kwargs):
        self.type = type

    def selections(self, data, freeform, rangeSelection):
        if isinstance(self, PointSelection):
            ids = self.ids
            if self.action == "Selection":
                freeform.extend(ids)
            else:
                freeform = list(filter(lambda x: x not in ids, freeform))
        elif isinstance(self, RangeSelection):
            if self.action == "Remove":
                del rangeSelection[self.rangeId]
            else:
                sels = []

                for k, v in self.extents.items():
                    d = data[(data[k] >= v["min"]) & (data[k] <= v["max"])]
                    sels.append(d["id"].tolist())

                sels = set(sels[0]).intersection(*sels)
                rangeSelection[self.rangeId] = list(sels)

        else:
            return [], {}
        return freeform, rangeSelection

    def apply(
        self,
        record,
    ):
        pass


class PointSelection(Selection):
    def __init__(self, type, action, ids, **kwargs):
        self.type = type
        self.action = action
        self.ids = ids

    def apply(self, record):
        r = deepcopy(record)
        r.add_point_selection(self)
        return r


class RangeSelection(Selection):
    def __init__(self, type, view, rangeId, action, extents, **kwargs):
        self.type = type
        self.view = view
        self.action = action
        self.rangeId = rangeId
        self.extents = extents

    def apply(self, record):
        r = deepcopy(record)
        if self.action == "Add" or self.action == "Update":
            r.add_update_brush(self.__dict__)
        elif self.action == "Remove":
            r.remove_brush(self.__dict__)
        return r


class AlgorithmicSelection(Selection):
    def __init__(self, type, apply, **kwargs):
        self.type = type
        self.intent = Intent.from_intent(apply)


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
    def __init__(self, id, name, drop, rules, **kwargs):
        self.id = id
        self.name = name
        self.drop = drop
        self.rules = rules
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
        vs = ViewSpec(interaction)
        if vs.type == "Scatterplot":
            return ScatterplotSpec(interaction)
        elif vs.type == "PCP":
            return PCPSpec(interaction)
    elif i_type == "Selection":
        sel = Selection(**interaction)
        if sel.type == "Point":
            return PointSelection(**interaction)
        elif sel.type == "Range":
            return RangeSelection(**interaction)
        elif sel.type == "Algorithmic":
            return AlgorithmicSelection(**interaction)
    elif i_type == "Label":
        return Label(**interaction)
    elif i_type == "Filter":
        return Filter(**interaction)
    elif i_type == "Categorize":
        return Categorize(**interaction)
    elif i_type == "Aggregation":
        return Aggregate(**interaction)
    elif i_type == "ReplaceAggregate":
        return ReplaceAggregate(**interaction)
    return GenericInteraction()


class Interactions:
    def __init__(self, interactions):
        if type(interactions) is not list:
            raise Exception("Only accepts list of interactions")

        self.order = []

        for i in interactions:
            self.order.append(getInteraction(i))

    @property
    def latest(self) -> BaseInteraction:
        return self.order[-1]

    def inferSelectionsAndDimensions(self, data):
        data = data.copy(deep=True)
        dimensions: List[str] = []
        freeform = []
        brushSelections = {}

        for interaction in self.order:
            if isinstance(interaction, ViewSpec):
                dims = interaction.dimensions
                dimensions.extend(dims)
            elif isinstance(interaction, Selection):
                freeform, brushSelections = interaction.selections(
                    data, freeform, brushSelections
                )
            elif isinstance(interaction, Filter):
                action = interaction.action
                sels = compute_selections(freeform, brushSelections)
                if action == "In":
                    data = data[data.id.isin(sels)]
                else:
                    data = data[~data.id.isin(sels)]

                freeform = []
                brushSelections = {}
            else:
                freeform = []
                brushSelections = {}

        selections = compute_selections(freeform, brushSelections)

        return dimensions, selections


def compute_selections(freeform, brushSelections):
    selections: List[str] = []
    selections.extend(freeform)

    for _, v in brushSelections.items():
        selections.extend(v)

    selections = list(set(selections))
    return selections
