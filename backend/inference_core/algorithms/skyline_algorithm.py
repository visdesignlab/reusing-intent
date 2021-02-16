import json
from itertools import product
from typing import List

import pandas as pd
from paretoset import paretoset

from backend.server.database.schemas.algorithms.skyline import Skyline


def get_sense_combinations(columns: List[str]):
    if len(columns) <= 2:
        res = product(["min", "max"], repeat=len(columns))
        return list([list(r) for r in res])
    return [["min"] * len(columns), ["max"] * len(columns)]


def pareto(data, sense):
    mask = paretoset(data, sense)
    mask = mask.astype(int)
    return mask, sense


def computeSkyline(data: pd.DataFrame, dimensions, record_id):
    senses = get_sense_combinations(list(data.columns))

    results = [pareto(data, sense) for sense in senses]

    rets = [
        (",".join(map(str, mask)), json.dumps({"sense": sense}))
        for mask, sense in results
    ]

    return [
        Skyline(dimensions=dimensions, output=output, info=info, record_id=record_id)
        for output, info in rets
    ]
