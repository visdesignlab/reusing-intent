from typing import Any

import pandas as pd
from celery.exceptions import Ignore
from celery.states import STARTED, SUCCESS

from backend.inference_core.algorithms.dbscan import computeDBScan, get_dbscan_count
from backend.inference_core.algorithms.kmeans import (
    computeKMeansClusters,
    get_kmeans_count,
)
from backend.inference_core.algorithms.linear_regression import computeLR
from backend.server.celery.init import celery
from backend.server.database.schemas.algorithms.cluster import (
    DBScanCluster,
    KMeansCluster,
)
from backend.server.database.schemas.algorithms.outlier import DBScanOutlier
from backend.server.database.schemas.algorithms.regression import LinearRegression
from backend.server.database.session import getSessionScopeFromId


@celery.task(bind=True)
def precomputeOutliers(self, data: Any, combinations, record_id, project):
    data = pd.read_json(data)
    # self.update_state(state=STARTED)

    to_process = sum([get_dbscan_count(data[combo]) for combo in combinations])
    processed = 0

    self.update_state(
        state=STARTED, meta={"processed": processed, "to_process": to_process}
    )

    for combo in combinations:
        subset = data[combo]
        dimensions = ",".join(combo)
        for output, params in computeDBScan(subset):
            with getSessionScopeFromId(project) as session:
                dbscan_cluster_result = DBScanOutlier(
                    dimensions=dimensions,
                    output=output,
                    info=params,
                    record_id=record_id,
                )
                session.add(dbscan_cluster_result)
            processed += 1
            self.update_state(
                state=STARTED, meta={"processed": processed, "to_process": to_process}
            )
    self.update_state(
        state=SUCCESS, meta={"processed": processed, "to_process": to_process}
    )
    raise Ignore()


@celery.task(bind=True)
def precomputeClusters(self, data: Any, combinations, record_id, project):
    data = pd.read_json(data)
    # self.update_state(state=STARTED)

    to_process = [get_dbscan_count(data[combo]) for combo in combinations]
    to_process.extend([get_kmeans_count() for _ in combinations])
    to_process = sum(to_process)
    processed = 0

    self.update_state(
        state=STARTED, meta={"processed": processed, "to_process": to_process}
    )

    for combo in combinations:
        subset = data[combo]
        dimensions = ",".join(combo)
        for output, params in computeDBScan(subset):
            with getSessionScopeFromId(project) as session:
                dbscan_cluster_result = DBScanCluster(
                    dimensions=dimensions,
                    output=output,
                    info=params,
                    record_id=record_id,
                )
                session.add(dbscan_cluster_result)
            processed += 1
            self.update_state(
                state=STARTED, meta={"processed": processed, "to_process": to_process}
            )
        for output, params in computeKMeansClusters(subset):
            with getSessionScopeFromId(project) as session:
                kmeans_result = KMeansCluster(
                    dimensions=dimensions,
                    output=output,
                    info=params,
                    record_id=record_id,
                )
                session.add(kmeans_result)
            processed += 1
            self.update_state(
                state=STARTED, meta={"processed": processed, "to_process": to_process}
            )
    self.update_state(
        state=SUCCESS, meta={"processed": processed, "to_process": to_process}
    )
    raise Ignore()


@celery.task(bind=True)
def precomputeLR(self, data: Any, combinations, record_id, project):
    data = pd.read_json(data)

    # TODO:  For higher dimensions do we iterate over whi. h will be the dependant variable?
    combinations = list(filter(lambda x: len(x) == 2, combinations))

    to_process = 2 * len(combinations)
    processed = 0

    self.update_state(
        state=STARTED, meta={"processed": processed, "to_process": to_process}
    )

    for combo in combinations:
        subset = data[combo]
        dimensions = ",".join(combo)
        for output, params in computeLR(subset):
            with getSessionScopeFromId(project) as session:
                linear_regression_result = LinearRegression(
                    dimensions=dimensions,
                    output=output,
                    info=params,
                    record_id=record_id,
                )
                session.add(linear_regression_result)
            processed += 1
            self.update_state(
                state=STARTED, meta={"processed": processed, "to_process": to_process}
            )

    self.update_state(
        state=SUCCESS, meta={"processed": processed, "to_process": to_process}
    )
    raise Ignore()
