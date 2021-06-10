import json

import pandas as pd
from celery.exceptions import Ignore
from celery.states import STARTED, SUCCESS
from reapply_workflows.compute.dbscan import dbscan
from reapply_workflows.compute.isolationforest_outlier import isolationforest_outlier

from ..db import db
from ..db.models.algorithm_outputs.outlier import DBScanOutlier, IsolationForestOutlier


def compute_dbscan_outliers(ctx, data, combinations, record_id):
    try:
        data = pd.read_json(data)

        epss = [0.1, 0.2, 0.5, 0.7, 1]

        size = data.shape[0]
        min_samples = []

        for m in range(0, size + 1, 5):
            if m == 0:
                continue
            if m <= 20:
                min_samples.append(m)
            elif m <= 50 and m % 10 == 0:
                min_samples.append(m)
            elif m <= 500 and m % 100 == 0:
                min_samples.append(m)

        total = len(combinations) * len(epss) * len(min_samples)
        processed = 0

        ctx.update_state(state=STARTED, meta={"total": total, "processed": processed})

        for combo in combinations:
            for eps in epss:
                for m in min_samples:
                    clf = dbscan(data[combo].values, eps, m)
                    out = DBScanOutlier(
                        record_id=record_id,
                        params=json.dumps(clf.get_params()),
                        dimensions=",".join(combo),
                        output=",".join(map(str, clf.labels_)),
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


def compute_isolationforest_outliers(ctx, data, combinations, record_id):
    try:
        data = pd.read_json(data)

        contaminations = [0.1, 0.2, 0.3, 0.4, 0.5]

        total = len(combinations) * len(contaminations)
        processed = 0
        ctx.update_state(state=STARTED, meta={"total": total, "processed": processed})

        for combo in combinations:
            for contamination in contaminations:
                clf, labels = isolationforest_outlier(data[combo].values, contamination)
                out = IsolationForestOutlier(
                    record_id=record_id,
                    params=json.dumps(clf.get_params()),
                    dimensions=",".join(combo),
                    output=",".join(map(str, labels)),
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
