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
        deepcopy(self)

    def update_plot(self, plot: Plot):
        rec = self.copy()
        rec.plots[plot.id] = plot
        return rec

    def add_point_selection(self, id: str, points: List[str]):
        rec = self.copy()
        if id not in rec.pointSelection:
            rec.pointSelection[id] = []
        rec.pointSelection[id].extend(points)
        return rec

    def updateBrushSelection(self, plot_id: str, brush: Brush, data: pd.DataFrame):
        plot = self.plots[plot_id]
        subset = data[plot.dimensions]
        mask = brush.get_brush_mask(subset.values)
        selected_ids = data[mask].id.tolist()
        self.brushSelections[brush.id] = selected_ids

    def add_brush(self, plot_id: str, brush: Brush, data: pd.DataFrame):
        rec = self.copy()
        if plot_id not in rec.brushes:
            rec.brushes[plot_id] = BrushCollection()
        rec.brushes[plot_id].add_brush(brush)
        rec.updateBrushSelection(plot_id, brush, data)
        return rec

    def update_brush(self, plot_id: str, brush, data: pd.DataFrame):
        rec = self.copy()
        rec.brushes[plot_id].add_brush(brush)
        rec.updateBrushSelection(plot_id, brush, data)
        return rec

    def remove_brush(self, plot_id: str, brush):
        rec = self.copy()
        rec.brushes[plot_id].remove_brush(brush)
        del rec.brushSelections[brush.id]
        return rec

    def empty(self):
        self.brushes = {}
        self.pointSelection = {}
        self.brushSelection = {}
        self.prediction = None

    def set_prediction(
        self, prediction: Prediction, data: pd.DataFrame, target_id: str
    ):
        rec = self.copy()
        rec.empty()
        rec.prediction = applyPrediction(prediction, self.selections(), data, target_id)
        return rec

    def set_filter(self, filterType, data):
        rec = self.copy()
        rec.empty()
        rec.filter = {"type": filterType, "points": self.selections()}
        return rec

    def copy(self):
        return deepcopy(self)

    # def brushSelections(self, data):
    #     brushSelections = {}

    #     if not self.brushes.isEmpty:
    #         for brush in self.brushes.to_list():
    #             plot_id = self.brushDict[brush.id]
    #             plot = self.plots[plot_id]
    #             subset = data[plot.dimensions]
    #             mask = brush.get_brush_mask(subset.values)
    #             selected_ids = data[mask].id.tolist()
    #             brushSelections[brush.id] = selected_ids
    #     return brushSelections

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


def applyPrediction(
    prediction: Prediction, selections: List[str], target: pd.DataFrame, target_id: str
) -> Prediction:
    print(prediction.original_id == target_id)
    print(prediction.original_id)
    print(target_id)
    if prediction.original_id is not None and prediction.original_id == target_id:
        return prediction
    algorithm = Algorithms(prediction.algorithm)
    intent = Intents(prediction.intent)
    dimensions = prediction.dimensions
    info = prediction.info

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

        # print(info["selected_center"], closest_center)
        # print(len(prediction.memberIds), len(ids.tolist()))
        # print(centers, np.array(info["centers"]))
    elif algorithm == Algorithms.DBSCAN:
        eps = info["params"]["eps"]
        min_samples = info["params"]["min_samples"]
        if intent == Intents.CLUSTER:
            ids, hull = applyDBScanCluster(
                target, prediction.dimensions, eps, min_samples, prediction.memberIds
            )
            info["hull"] = hull
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

    return Prediction(
        rank=rank_jaccard(ids, np.array(selections)),
        intent=intent.value,
        memberIds=ids.tolist(),
        dimensions=prediction.dimensions,
        info=new_info,
        algorithm=algorithm.value,
        membership=getStats(ids, selections),
        description=prediction.description,
    )
