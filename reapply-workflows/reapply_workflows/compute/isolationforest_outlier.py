import numpy as np
from sklearn.ensemble import IsolationForest

from ..scalers.robust import fit_transform


def isolationforest_outlier(data: np.ndarray, contamination=0.1):
    scaled_data = fit_transform(data)

    clf = IsolationForest(contamination=contamination)
    clf.fit(scaled_data)

    return clf, clf.fit_predict(scaled_data)
