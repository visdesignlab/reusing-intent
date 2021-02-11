from typing import List

from backend.utils.hash import getUIDForString


class Prediction(object):
    rank: float
    intent: str
    algorithm: str
    description: str
    memberIds: List[str]
    dimensions: List[str]
    info: dict
    membership: dict

    def __init__(
        self,
        rank,
        intent,
        algorithm,
        description,
        memberIds,
        dimensions,
        info,
        membership,
    ) -> None:
        self.rank = rank
        self.intent = intent
        self.algorithm = algorithm
        self.description = description
        self.memberIds = memberIds
        self.dimensions = dimensions
        self.info = info
        self.membership = membership

    def serialize(self):
        return self.__dict__

    def get_hash(self):
        hashString = "_".join(sorted(self.memberIds))
        hashString = f"{hashString}_{self.algorithm}_{self.intent}"
        return getUIDForString(hashString)
