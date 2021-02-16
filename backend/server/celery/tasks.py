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
from backend.inference_core.algorithms.skyline_algorithm import (
    computeSkyline,
    get_sense_combinations,
)
from backend.server.celery.init import celery
from backend.server.database.session import getSessionScopeFromId


@celery.task(bind=True)
def precomputeOutliers(self, data: Any, combinations, record_id, project):
    data = pd.read_json(data)
    # self.update_state(state=STARTED)

    combinations = list(filter(lambda x: len(x) < 3, combinations))

    to_process = sum([get_dbscan_count(data[combo]) for combo in combinations])
    processed = 0

    self.update_state(
        state=STARTED, meta={"processed": processed, "to_process": to_process}
    )

    for combo in combinations:
        subset = data[combo]
        dimensions = ",".join(combo)
        for result in computeDBScan(subset, dimensions, record_id, True):
            with getSessionScopeFromId(project) as session:
                session.add(result)
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

    combinations = list(filter(lambda x: len(x) < 3, combinations))

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
        for result in computeDBScan(subset, dimensions, record_id, False):
            with getSessionScopeFromId(project) as session:
                session.add(result)
            processed += 1
            self.update_state(
                state=STARTED, meta={"processed": processed, "to_process": to_process}
            )
        for result in computeKMeansClusters(subset, dimensions, record_id):
            with getSessionScopeFromId(project) as session:
                session.add(result)
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
        for result in computeLR(subset, dimensions, record_id):
            with getSessionScopeFromId(project) as session:
                session.add(result)
            processed += 1
            self.update_state(
                state=STARTED, meta={"processed": processed, "to_process": to_process}
            )

    self.update_state(
        state=SUCCESS, meta={"processed": processed, "to_process": to_process}
    )
    raise Ignore()


@celery.task(bind=True)
def precomputeSkyline(self, data: Any, combinations, record_id, project):
    data = pd.read_json(data)

    to_process = [len(get_sense_combinations(comb)) for comb in combinations]
    to_process = sum(to_process)
    processed = 0

    self.update_state(
        state=STARTED, meta={"processed": processed, "to_process": to_process}
    )

    for combo in combinations:
        subset = data[combo]
        dimensions = ",".join(combo)
        for result in computeSkyline(subset, dimensions, record_id):
            with getSessionScopeFromId(project) as session:
                session.add(result)

            processed += 1
            self.update_state(
                state=STARTED, meta={"processed": processed, "to_process": to_process}
            )

    self.update_state(
        state=SUCCESS, meta={"processed": processed, "to_process": to_process}
    )
    raise Ignore()
