import json
from abc import ABC, abstractmethod
from typing import List

import numpy as np
from sqlalchemy.sql.schema import Column
from sqlalchemy.sql.sqltypes import Integer, String


class IntentBase(ABC):
    id = Column(Integer, primary_key=True)
    params = Column(String, nullable=False)
    dimensions = Column(String, nullable=False)
    output = Column(String, nullable=False)

    def getParams(self):
        return json.loads(self.params)

    def getDimensionArr(self) -> List[str]:
        return self.dimensions.split(",")

    def getMemberIds(self, arr: np.ndarray) -> List[int]:
        return np.where(arr == 1)[0].tolist()  # type: ignore

    @property
    @abstractmethod
    def intentType(self) -> str:
        pass

    @property
    @abstractmethod
    def algorithm(self) -> str:
        pass

    @property
    @abstractmethod
    def description(self) -> str:
        pass

    @abstractmethod
    def predict(self, selection: List[int]):
        pass
