from typing import List

from backend.utils.hash import getUIDForString


class Prediction(object):
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
        hash=None,
    ) -> None:
        self.rank: float = rank
        self.intent: str = intent
        self.algorithm: str = algorithm
        self.description: str = description
        self.memberIds: List[str] = memberIds
        self.dimensions: List[str] = dimensions
        self.info: dict = info
        self.membership: dict = membership
        self.hash: str = self.get_hash()
        if hash:
            self.hash = hash

    def serialize(self):
        return self.__dict__

    def get_hash(self):
        hashString = "_".join(sorted(self.memberIds))
        hashString = f"{hashString}_{self.algorithm}_{self.intent}"
        return getUIDForString(hashString)
