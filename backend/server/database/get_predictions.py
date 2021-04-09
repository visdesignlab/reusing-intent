from typing import List

from backend.inference_core.prediction import Prediction
from backend.server.database.schemas.algorithms.cluster import (
    DBScanCluster,
    KMeansCluster,
)
from backend.server.database.schemas.algorithms.outlier import DBScanOutlier
from backend.server.database.schemas.algorithms.regression import LinearRegression
from backend.server.database.schemas.algorithms.skyline import Skyline


def get_predictions(record_id, dataset, selections, dimensions, session):
    predictions: List[Prediction] = []
    kmeanscluster = (
        session.query(KMeansCluster)
        .filter(KMeansCluster.record_id == record_id)
        .filter(KMeansCluster.dimensions == ",".join(dimensions))
        .distinct(KMeansCluster.output)
        .all()
    )
    dbscancluster = (
        session.query(DBScanCluster)
        .filter(DBScanCluster.record_id == record_id)
        .filter(DBScanCluster.dimensions == ",".join(dimensions))
        .distinct(DBScanCluster.output)
        .all()
    )
    dbscanoutlier = (
        session.query(DBScanOutlier)
        .filter(DBScanOutlier.record_id == record_id)
        .filter(DBScanOutlier.dimensions == ",".join(dimensions))
        .distinct(DBScanOutlier.output)
        .all()
    )
    linearregression = (
        session.query(LinearRegression)
        .filter(LinearRegression.record_id == record_id)
        .filter(LinearRegression.dimensions == ",".join(dimensions))
        .distinct(LinearRegression.output)
        .all()
    )
    skyline = (
        session.query(Skyline)
        .filter(Skyline.record_id == record_id)
        .filter(Skyline.dimensions == ",".join(dimensions))
        .distinct(Skyline.output)
        .all()
    )

    algs = []
    algs.extend(kmeanscluster)
    algs.extend(dbscancluster)
    algs.extend(dbscanoutlier)
    algs.extend(linearregression)
    algs.extend(skyline)

    for a in algs:
        predictions.extend(a.predict(selections, dataset))

    return predictions
