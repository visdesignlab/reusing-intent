import json
from typing import Any

import pandas as pd
from celery.exceptions import Ignore
from celery.states import STARTED, SUCCESS
from reapply_workflows.inference.algorithms.Skyline import (
    MultivariateOptimization,
    get_sense_combinations,
)

from ..db import db
from ..db.models.intent import Intent


def compute_skyline(ctx, data: Any, combinations, record_id):
    try:
        data = pd.read_json(data)
        senses = [len(get_sense_combinations(combo)) for combo in combinations]
        total = sum(senses)
        processed = 0

        ctx.update_state(state=STARTED, meta={"total": total, "processed": processed})

        for output in MultivariateOptimization.compute(data, combinations):
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
