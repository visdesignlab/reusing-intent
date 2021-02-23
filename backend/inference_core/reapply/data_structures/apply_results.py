from typing import Dict, List, Optional

from backend.inference_core.prediction import Prediction


class Changes(object):
    def __init__(self, added, removed, changed, result, **kwargs):
        self.added: List[str] = added
        self.changed: List[str] = changed
        self.removed: List[str] = removed
        self.result: List[str] = result
        for k, v in kwargs.items():
            setattr(self, k, v)

    def serialize(self, final=False):
        ret = self.__dict__
        if final and "result" in ret:
            del ret["result"]
        return ret


class ApplyResults(object):
    def __init__(self):
        self.changeRecord: Dict[str, Changes] = {}
        self.selected_points_record: Dict[str, List[str]] = {}
        self.prediction: Optional[Prediction] = None

    def add_change_record(self, id, record):
        self.changeRecord[id] = record

    def update_selections(self, key: str, selected_points=[], override=False):
        if override:
            self.selected_points_record = {}
        self.selected_points_record[key] = selected_points

    def update_predictions(self, prediction=None):
        self.prediction = prediction

    @property
    def selected_points(self):
        sels: List[str] = []
        for points in self.selected_points_record.values():
            sels.extend(points)

        sels = list(set(sels))
        return sels

    def serialize(self):
        changeRecord = {}
        for k, v in self.changeRecord.items():
            changeRecord[k] = v.serialize(final=True)

        return changeRecord
