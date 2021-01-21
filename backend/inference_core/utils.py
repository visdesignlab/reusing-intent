import numpy as np
from sklearn.preprocessing import RobustScaler


def robustScaler(values: np.ndarray):
    return RobustScaler().fit_transform(values)


def robustScaler2(values: np.ndarray):
    scaler = RobustScaler().fit(values)
    return scaler
