from typing import List, TypedDict


class Prediction(TypedDict):
    rank: float
    intent: str
    algorithm: str
    memberIds: List[int]
    dimensions: List[str]
    params: dict
