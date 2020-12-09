import numpy as np
from sklearn.preprocessing import RobustScaler


def robustScaler(values: np.ndarray):
    return RobustScaler().fit_transform(values)
