import pandas as pd

from backend.inference_core.algorithms.skyline_algorithm import pareto


def applySkyline(data: pd.DataFrame, dimensions, sense):
    # mask = paretoset(data[dimensions], sense)
    # ids = data[mask].id.tolist()

    ids, sense = pareto(data[dimensions], sense)

    info = {"sense": sense}

    return ids, info
