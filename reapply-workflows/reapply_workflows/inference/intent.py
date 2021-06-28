from typing import Any

from .algorithms.base import AlgorithmBase


class Intent:
    def __init__(
        self,
        intent: str,
        algorithm: str,
        output: str,
        dimensions: str,
        params: Any,
        info: Any,
        **kwargs
    ):
        self.intent = intent
        self.algorithm = algorithm
        self.output = list(map(int, output.split(",")))
        self.dimensions = dimensions.split(",")
        self.params = params
        self.info = info

    @staticmethod
    def from_algorithm(alg: AlgorithmBase):
        return Intent(**alg.to_dict())
