from copy import deepcopy
from typing import Any, Dict, List, Optional

import numpy as np
import pandas as pd

from backend.inference_core.prediction import Prediction
from backend.inference_core.prediction_stats import getStats
from backend.inference_core.rankings import rank_jaccard
from backend.inference_core.reapply.data_structures.brush import Brush, BrushCollection
from backend.inference_core.reapply.data_structures.plot import Plot
from backend.inference_core.reapply.data_structures.types import Algorithms, Intents
from backend.inference_core.reapply.reapply_algorithms.dbscan import (
    applyDBScanCluster,
    applyDBScanOutlier,
)
from backend.inference_core.reapply.reapply_algorithms.kmeans import applyKMeans
from backend.inference_core.reapply.reapply_algorithms.linear_regression import (
    apply_linear_regression,
)
from backend.inference_core.reapply.reapply_algorithms.range import apply_range
from backend.inference_core.reapply.reapply_algorithms.skyline import applySkyline


class Filter:
    def __init__(self, type):
        self.type = type
        self.points: List[str] = []

    def serialize(self):
        return {"type": self.type, "points": self.points}


class Record:
    def __init__(self):
        self.plots: Dict[str, Plot] = {}
        self.brushes: Dict[str, BrushCollection] = {}
        self.pointSelection: Dict[str, List[str]] = {}
        self.prediction: Optional[Prediction] = None
        self.filter: Any = None
        self.brushSelections: Dict[str, List[str]] = {}

    def update_plot(self, plot: Plot):
        self.plots[plot.id] = plot

    def remove_plot(self, plot: str):
        if plot in self.plots:
            del self.plots[plot]
        if plot in self.pointSelection:
            del self.pointSelection[plot]
        if plot in self.brushes:
            del self.brushes[plot]

    def add_point_selection(self, id: str, points: List[str]):
        if id not in self.pointSelection:
            self.pointSelection[id] = []
        self.pointSelection[id].extend(points)
        self.pointSelection[id] = list(set(self.pointSelection[id]))

    def updateBrushSelection(self, plot_id: str, brush: Brush, data: pd.DataFrame):
        plot = self.plots[plot_id]
        subset = data[plot.dimensions]
        mask = brush.get_brush_mask(subset.values)
        selected_ids = data[mask].id.tolist()
        self.brushSelections[brush.id] = selected_ids

    def add_brush(self, plot_id: str, brush: Brush, data: pd.DataFrame):
        if plot_id not in self.brushes:
            self.brushes[plot_id] = BrushCollection()
        self.brushes[plot_id].add_brush(brush)
        self.updateBrushSelection(plot_id, brush, data)

    def update_brush(self, plot_id: str, brush, data: pd.DataFrame):
        self.brushes[plot_id].add_brush(brush)
        self.updateBrushSelection(plot_id, brush, data)

    def remove_brush(self, plot_id: str, brush):
        self.brushes[plot_id].remove_brush(brush)
        del self.brushSelections[brush]

    def empty(self):
        self.brushes = {}
        self.pointSelection = {}
        self.brushSelections = {}
        self.prediction = None

    def set_prediction(
        self,
        prediction: Prediction,
        data: pd.DataFrame,
        target_id: str,
    ):
        sels = deepcopy(self.selections())
        self.empty()
        self.prediction = applyPrediction(
            prediction,
            sels,
            data,
            target_id,
        )

    def set_filter(self, filterType):
        sels = deepcopy(self.selections())
        self.empty()
        self.filter = {"type": filterType, "points": sels}

    def copy(self):
        return deepcopy(self)

    def selections(self):
        points: List[str] = []

        if self.prediction:
            points.extend(self.prediction.memberIds)

        for brushColl in self.brushes.values():
            if not brushColl.isEmpty:
                for v in self.brushSelections.values():
                    points.extend(v)

        if len(self.pointSelection.values()) > 0:
            for v in self.pointSelection.values():
                points.extend(v)

        return list(set(points))

    def serialize(self):
        plots = {}
        for k, v in self.plots.items():
            plots[k] = v.serialize()

        brushes = {}
        for k, v in self.brushes.items():
            brushes[k] = v.serialize()

        return {
            "plots": plots,
            "brushes": brushes,
            "brushSelections": self.brushSelections,
            "pointSelection": self.pointSelection,
            "prediction": self.prediction.serialize() if self.prediction else None,
            "filter": self.filter if self.filter else None,
        }

    def apply(self, data):
        target = data.copy()
        if self.filter:
            points = self.filter["points"]
            target = target[~target.id.isin(points)]

        if self.selections():
            target["isSelected"] = False
            mask = target.id.isin(self.selections())
            target.loc[mask, "isSelected"] = True

        target.drop(["id", "iid"], axis=1, inplace=True)
        return target


def applyPrediction(
    prediction: Prediction,
    selections: List[str],
    target: pd.DataFrame,
    target_id: str,
) -> Prediction:
    if prediction.original_id is not None and prediction.original_id == target_id:
        return prediction

    algorithm = Algorithms(prediction.algorithm)
    intent = Intents(prediction.intent)
    dimensions = prediction.dimensions
    info = prediction.info
    sels = target.id.isin(selections)

    ids = np.array([])
    new_info = deepcopy(info)

    if algorithm == Algorithms.KMEANS:
        ids, centers, hull, closest_center = applyKMeans(
            target,
            dimensions,
            info["params"]["n_clusters"],
            info["selected_center"],
            np.array(info["centers"]),
        )
        new_info["centers"] = centers.tolist()
        new_info["hull"] = hull
        new_info["selected_center"] = closest_center

    elif algorithm == Algorithms.DBSCAN:
        eps = info["params"]["eps"]
        min_samples = info["params"]["min_samples"]
        if intent == Intents.CLUSTER:
            ids, hull = applyDBScanCluster(
                target, prediction.dimensions, eps, min_samples, prediction.memberIds
            )
            new_info["hull"] = hull
        elif intent == Intents.OUTLIER or intent == Intents.NONOUTLIER:
            ids = applyDBScanOutlier(
                target,
                prediction.dimensions,
                eps,
                min_samples,
                intent != Intents.NONOUTLIER,
            )
    elif algorithm == Algorithms.DECISIONTREE:
        ids = apply_range(target, info["rules"])
    elif algorithm == Algorithms.BNL:
        ids, new_info = applySkyline(target, prediction.dimensions, info["sense"])
        ids = ids.astype(bool)
        new_info["frontier"] = target[ids][prediction.dimensions].values.tolist()
        ids = target[ids].id
    elif algorithm == Algorithms.LR:
        return apply_linear_regression(target, prediction, sels)

    intents = target.id.isin(ids)

    return Prediction(
        rank=rank_jaccard(intents, sels),
        intent=intent.value,
        memberIds=ids.tolist() if type(ids) is not list else ids,
        dimensions=prediction.dimensions,
        info=new_info,
        algorithm=algorithm.value,
        membership=getStats(ids, selections),
        description=prediction.description,
    )
