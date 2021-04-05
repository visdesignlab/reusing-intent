import json

import numpy as np
import pandas as pd
from sklearn.linear_model import TheilSenRegressor

from backend.server.database.schemas.algorithms.regression import LinearRegression as LR


def computeLR(data: pd.DataFrame, dimensions, record_id):
    # reg = LinearRegression()
    reg = TheilSenRegressor(random_state=1, max_subpopulation=50)
    values = data.values

    numDims = np.size(values, 1)

    X = values[:, 0 : numDims - 1]
    Y = values[:, numDims - 1].reshape(-1, 1)

    ndf = data.copy(deep=True)
    ndf.reset_index(drop=True, inplace=True)

    ndf["X"] = X
    ndf["Y"] = Y
    ndf["Filter"] = True
    prev_length = 0
    within = None
    m = 0

    for _ in range(10):
        curr_idx = ndf.index[ndf.loc[:, "Filter"]]  # type: ignore
        curr = ndf.iloc[curr_idx, :]

        if prev_length == curr.shape[0]:
            break

        prev_length = curr.shape[0]

        x, y = curr["X"].values.reshape(-1, 1), curr["Y"].values

        reg.fit(x, y)
        ts = reg.predict(X)

        residuals = ts - ndf["Y"].values

        residuals = abs(residuals)

        inlier_residuals = abs(reg.predict(x) - y)

        m = np.median(inlier_residuals)

        within = residuals < (5 * m)

        ndf["Filter"] = within

    within = ndf["Filter"].astype(int)  # type: ignore

    coeffs = reg.coef_.tolist()
    intercept = reg.intercept_

    threshold = m  # type: ignore

    return [
        LR(
            dimensions=dimensions,
            output=",".join(map(str, within.tolist())),
            info=json.dumps(
                {
                    "threshold": threshold,
                    "coeff": coeffs,
                    "intercept": intercept,
                    "type": "within",
                }
            ),
            record_id=record_id,
        )
    ]
