from typing import List

from backend.server.database.schemas.algorithms.intent_base import IntentBase

from ..base import Base


class RegressionBase(IntentBase):
    def processOutput(self):
        print("Process")

    def predict(self, selection: List[int]):
        print("Predict")


class LinearRegression(Base, RegressionBase):
    __tablename__ = "LinearRegression"

    @property
    def intentType(self) -> str:
        return "LR"

    @property
    def algorithm(self) -> str:
        return "LR"

    @property
    def description(self) -> str:
        return f"{self.intentType}:{self.algorithm}"


class QuadraticRegression(Base, RegressionBase):
    __tablename__ = "QuadraticRegression"

    @property
    def intentType(self) -> str:
        return "QR"

    @property
    def algorithm(self) -> str:
        return "QR"

    @property
    def description(self) -> str:
        return f"{self.intentType}:{self.algorithm}"
