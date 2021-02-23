from abc import abstractmethod
from typing import List

import pandas as pd

from backend.inference_core.reapply.data_structures.apply_results import ApplyResults
from backend.inference_core.reapply.data_structures.types import InteractionType


class BaseInteraction(object):
    dependencies: List[InteractionType] = []

    def __init__(self, id, type):
        self.parent: BaseInteraction = NoneInteraction()
        self.id: str = id
        self.type: InteractionType = InteractionType(type)

    def to_json(self):
        return {"id": self.id, "type": self.type.value, "deps": self.dependencies}

    def set_parent(self, id=None):
        self.parent = id

    def apply_parent(self, base: pd.DataFrame, updated: pd.DataFrame):
        parent = self.parent
        results = parent.apply(base, updated)
        return results

    @abstractmethod
    def apply(self, base: pd.DataFrame, updated: pd.DataFrame) -> ApplyResults:
        pass


class NoneInteraction(BaseInteraction):
    def __init__(self):
        self.id = "NA"
        self.type = InteractionType.NONE

    def apply(self, base: pd.DataFrame, updated: pd.DataFrame):
        return ApplyResults()
