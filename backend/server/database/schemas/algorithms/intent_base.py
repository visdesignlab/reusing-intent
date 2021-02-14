import json
from abc import ABC, abstractmethod
from typing import List

import numpy as np
from sqlalchemy.sql.schema import Column
from sqlalchemy.sql.sqltypes import Integer, String


class IntentBase(ABC):
    id = Column(Integer, primary_key=True)
    record_id = Column(Integer, nullable=False)
    info = Column(String, nullable=False)
    dimensions = Column(String, nullable=False)
    output = Column(String, nullable=False)

    def getInfo(self):
        return json.loads(self.info)

    def getDimensionArr(self) -> List[str]:
        return self.dimensions.split(",")

    def getMemberIds(self, arr: np.ndarray, ids) -> List[str]:
        return list(sorted(ids.iloc[np.where(arr == 1)[0].tolist()].values.tolist()))  # type: ignore

    @property
    @abstractmethod
    def intentType(self) -> str:
        pass

    @property
    @abstractmethod
    def algorithm(self) -> str:
        pass

    @property
    def description(self) -> str:
        return f"{self.intentType}-{self.algorithm}"

    @abstractmethod
    def predict(self, selection: List[int]):
        pass
