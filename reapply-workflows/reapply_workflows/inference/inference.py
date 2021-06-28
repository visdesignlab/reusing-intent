from typing import List

import pandas as pd

from ..compute.dbscan import dbscan_params
from ..compute.isolationforest_outlier import isolationforest_params
from ..compute.kmeans_cluster import kmeans_params
from ..compute.regression import regression_params
from .algorithms.DBScanCluster import DBScanCluster
from .algorithms.DBScanOutlier import DBScanOutlier
from .algorithms.IsolationForestOutlier import IsolationForestOutlier
from .algorithms.KMeansCluster import KMeansCluster
from .algorithms.LinearRegression import LinearRegression
from .algorithms.PolynomialRegression import PolynomialRegression
from .algorithms.Skyline import MultivariateOptimization
from .intent import Intent
from .prediction import Prediction


class Inference:
    def __init__(
        self,
        data: pd.DataFrame,
        user_selection: List[str],
        dimensions=List[str],
        intents: List[Intent] = [],
    ):
        self.data = data
        self.user_selections = user_selection
        self.dimensions = dimensions
        self.intents = []
        if intents and len(intents) > 0:
            self.intents = intents
        else:
            self.intents = compute_intents(data, dimensions)

    def predict(self) -> List[Prediction]:
        predictions: List[Prediction] = []

        for intent in self.intents:
            preds = Prediction.from_intent(intent, self.data, self.user_selections)
            predictions.extend(preds)

        sorted_predictions = sorted(
            predictions, key=lambda x: x.rank_jaccard, reverse=True
        )

        final_preds = list(filter(lambda x: x.rank_jaccard >= 0.3, sorted_predictions))

        if len(final_preds) < 20:
            final_preds = sorted_predictions[:20]

        return list(final_preds)


def compute_intents(data: pd.DataFrame, _dimensions: List[str]) -> List[Intent]:
    epss, min_samples = dbscan_params(data.shape[0])
    intents: List[Intent] = []
    dimensions = [_dimensions]

    # Outliers
    dbscan_outliers = DBScanOutlier.compute(data, dimensions, epss, min_samples)
    intents.extend(map(lambda x: Intent(**x.to_dict()), dbscan_outliers))

    if_outliers = IsolationForestOutlier.compute(
        data, dimensions, isolationforest_params()
    )
    intents.extend(map(lambda x: Intent(**x.to_dict()), if_outliers))

    # Clusters
    kmeans_clusters = KMeansCluster.compute(data, dimensions, kmeans_params())
    intents.extend(map(lambda x: Intent(**x.to_dict()), kmeans_clusters))

    dbscan_clusters = DBScanCluster.compute(data, dimensions, epss, min_samples)
    intents.extend(map(lambda x: Intent(**x.to_dict()), dbscan_clusters))

    # Regressions
    linear_regression = LinearRegression.compute(data, dimensions, regression_params())
    intents.extend(map(lambda x: Intent(**x.to_dict()), linear_regression))

    polynomial_regression = PolynomialRegression.compute(
        data, dimensions, regression_params()
    )
    intents.extend(map(lambda x: Intent(**x.to_dict()), polynomial_regression))

    # Skyline
    skyline = MultivariateOptimization.compute(data, dimensions)
    intents.extend(map(lambda x: Intent(**x.to_dict()), skyline))

    return intents
