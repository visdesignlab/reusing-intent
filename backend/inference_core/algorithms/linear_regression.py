import json

import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression

from backend.inference_core.utils import robustScaler2
from backend.server.database.schemas.algorithms.regression import LinearRegression as LR


def computeLR(data: pd.DataFrame, dimensions, record_id):
    reg = LinearRegression()
    values = data.values

    numDims = np.size(values, 1)

    X = values[:, 0 : numDims - 1]
    Y = values[:, numDims - 1].reshape(-1, 1)

    X_scaler = robustScaler2(X)
    Y_scaler = robustScaler2(Y)

    X_scaled = X_scaler.transform(X)
    Y_scaled = Y_scaler.transform(Y)

    ndf = data.copy(deep=True)
    ndf["X"] = X_scaled
    ndf["Y"] = Y_scaled
    ndf["Filter"] = True
    prev_length = 0
    within = None
    m = 0
    for i in range(10):
        curr_idx = ndf.index[ndf.loc[:, "Filter"]]  # type: ignore
        curr = ndf.iloc[curr_idx, :]
        if prev_length == curr.shape[0]:
            break

        prev_length = curr.shape[0]

        x, y = curr["X"].values.reshape(-1, 1), curr["Y"].values

        reg.fit(x, y)
        ts = reg.predict(X_scaled)

        residuals = ts - Y_scaled
        residuals = np.absolute(residuals)

        inlier_residuals = np.absolute(reg.predict(x) - y)

        m = np.median(inlier_residuals)

        within = residuals < (5 * m)

        ndf["Filter"] = within

    within = ndf["Filter"].astype(int)  # type: ignore

    coeffs = X_scaler.inverse_transform(np.array(reg.coef_).reshape(-1, 1))[0].tolist()  # type: ignore
    intercept = Y_scaler.inverse_transform(np.array(reg.intercept_).reshape(-1, 1))[0][  # type: ignore
        0
    ]

    threshold = 3 * Y_scaler.inverse_transform(np.array(m).reshape(-1, 1))[0][0]  # type: ignore

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
