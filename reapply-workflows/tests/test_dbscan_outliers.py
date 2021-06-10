import numpy as np
import pandas as pd
from reapply_workflows.compute.range import range_alg


def test_something():
    arr = pd.read_csv("../datasets/Gapminder World/gapminder_2010.csv")
    arr.dropna(inplace=True)
    arr = arr[["life_exp", "gdp", "population"]]

    np.random.seed(1)

    selections = (
        (arr["gdp"] < 2000)
        & (arr["life_exp"] > 40)
        & (arr["population"] > 7610000)
        & (arr["population"] < 121000000)
    ).values

    rules, mask = range_alg(arr, selections)

    print(rules)

    assert False
