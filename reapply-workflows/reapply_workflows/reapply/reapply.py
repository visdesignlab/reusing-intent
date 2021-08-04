from typing import List

from ..inference.interaction import Interactions
from ..reapply.record import Record


class Reapply:
    def apply(self, interactions, data):
        inters = Interactions(interactions)
        inters.inferSelectionsAndDimensions(data)

        records: List[Record] = []

        for i in inters.order:
            rec = records[-1] if len(records) > 0 else Record(data)

            new_rec = i.apply(rec)
            records.append(new_rec)

        return records


# def apply(self, record: Record):
#     r = deepcopy(record)

#     return r
