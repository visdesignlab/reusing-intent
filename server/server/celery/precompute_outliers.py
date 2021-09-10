import json
from typing import Any

import pandas as pd
from celery.exceptions import Ignore
from celery.states import STARTED, SUCCESS
from reapply_workflows.compute.dbscan import dbscan_params
from reapply_workflows.compute.isolationforest_outlier import isolationforest_params
from reapply_workflows.inference.algorithms.DBScanOutlier import DBScanOutlier
from reapply_workflows.inference.algorithms.IsolationForestOutlier import (
    IsolationForestOutlier,
)

from ..db import db
from ..db.models.intent import Intent


def compute_dbscan_outliers(ctx, data: Any, combinations, record_id):
    try:
        data = pd.read_json(data)

        epss, min_samples = dbscan_params(data.shape[0])

        total = len(combinations) * len(epss) * len(min_samples)
        processed = 0

        ctx.update_state(state=STARTED, meta={"total": total, "processed": processed})

        outputs = DBScanOutlier.compute(data, combinations, epss, min_samples)

        for output in outputs:
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


def compute_isolationforest_outliers(ctx, data: Any, combinations, record_id):
    try:
        data = pd.read_json(data)

        contaminations = isolationforest_params()

        total = len(combinations) * len(contaminations)
        processed = 0
        ctx.update_state(state=STARTED, meta={"total": total, "processed": processed})

        for output in IsolationForestOutlier.compute(
            data, combinations, contaminations
        ):
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
            ctx.update_state(
                state=STARTED, meta={"total": total, "processed": processed}
            )

        ctx.update_state(state=SUCCESS, meta={"processed": processed, "total": total})
        raise Ignore()
    except Exception as err:
        print(err)
