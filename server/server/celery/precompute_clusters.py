import json
from typing import Any

import pandas as pd
from celery.exceptions import Ignore
from celery.states import STARTED, SUCCESS
from reapply_workflows.compute.dbscan import dbscan_params
from reapply_workflows.compute.kmeans_cluster import kmeans_params
from reapply_workflows.inference.algorithms.DBScanCluster import DBScanCluster
from reapply_workflows.inference.algorithms.KMeansCluster import KMeansCluster

from ..db import db
from ..db.models.intent import Intent


def compute_kmeans_clusters(ctx, data: Any, combinations, record_id):
    try:
        data = pd.read_json(data)

        n_clusters = kmeans_params()

        total = len(combinations) * len(n_clusters)
        processed = 0

        ctx.update_state(state=STARTED, meta={"total": total, "processed": processed})

        for output in KMeansCluster.compute(data, combinations, n_clusters):
            out = Intent(
                record_id=record_id,
                algorithm=output.algorithm,
                intent=output.intent,
                params=json.dumps(output.params),
                dimensions=",".join(output.dimensions),
                output=",".join(map(str, output.labels)),
            )
            db.session.add(out)
            db.session.commit()
            processed += 1
            ctx.update_state(
                state=STARTED, meta={"total": total, "processed": processed}
            )

        ctx.update_state(state=SUCCESS, meta={"processed": processed, "total": total})
        raise Ignore()
    except Exception as err:
        print(err)


def compute_dbscan_clusters(ctx, data: Any, combinations, record_id):
    try:
        data = pd.read_json(data)

        epss, min_samples = dbscan_params(data.shape[0])

        total = len(combinations) * len(epss) * len(min_samples)
        processed = 0

        ctx.update_state(state=STARTED, meta={"total": total, "processed": processed})

        for output in DBScanCluster.compute(data, combinations, epss, min_samples):
            out = Intent(
                record_id=record_id,
                algorithm=output.algorithm,
                intent=output.intent,
                params=json.dumps(output.params),
                dimensions=",".join(output.dimensions),
                output=",".join(map(str, output.labels)),
            )
            db.session.add(out)
            db.session.commit()
            processed += 1
            ctx.update_state(
                state=STARTED, meta={"total": total, "processed": processed}
            )
        ctx.update_state(state=SUCCESS, meta={"processed": processed, "total": total})
        raise Ignore()
    except Exception as err:
        print(err)
