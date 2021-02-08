import pandas as pd
from paretoset import paretoset


def applySkyline(data: pd.DataFrame, dimensions, sense):
    mask = paretoset(data[dimensions], sense)
    ids = data[mask].id.tolist()

    return ids
