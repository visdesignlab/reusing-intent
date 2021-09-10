import json
from typing import Any

import pandas as pd
from celery.exceptions import Ignore
from celery.states import STARTED, SUCCESS
from reapply_workflows.compute.regression import regression_params
from reapply_workflows.inference.algorithms.LinearRegression import LinearRegression
from reapply_workflows.inference.algorithms.PolynomialRegression import (
    PolynomialRegression,
)

from ..db import db
from ..db.models.intent import Intent


def compute_linear_regression(ctx, data: Any, combinations, record_id):
    try:
        data = pd.read_json(data)
        threshold_multipliers = regression_params()
        total = len(combinations) * len(threshold_multipliers)
        processed = 0

        ctx.update_state(state=STARTED, meta={"total": total, "processed": processed})

        for output in LinearRegression.compute(
            data, combinations, threshold_multipliers
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
            processed += 1
            ctx.update_state(
                state=STARTED, meta={"processed": processed, "total": total}
            )

        ctx.update_state(state=SUCCESS, meta={"processed": processed, "total": total})
        raise Ignore()
    except Exception as err:
        print(err)


def compute_polynomial_regression(ctx, data: Any, combinations, record_id):
    try:
        data = pd.read_json(data)
        threshold_multipliers = regression_params()
        total = len(combinations) * len(threshold_multipliers)
        processed = 0

        ctx.update_state(state=STARTED, meta={"total": total, "processed": processed})

        for output in PolynomialRegression.compute(
            data, combinations, threshold_multipliers
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
            processed += 1
            ctx.update_state(
                state=STARTED, meta={"processed": processed, "total": total}
            )

        ctx.update_state(state=SUCCESS, meta={"processed": processed, "total": total})
        raise Ignore()
    except Exception as err:
        print(err)
