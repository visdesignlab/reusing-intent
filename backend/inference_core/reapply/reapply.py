from copy import deepcopy
from typing import Any, Dict

import firebase_admin
import pandas as pd
from firebase_admin import credentials, db

from backend.inference_core.reapply.data_structures.base_interaction import (
    GenericInteraction,
)
from backend.inference_core.reapply.data_structures.brush_interaction import (
    BrushInteraction,
)
from backend.inference_core.reapply.data_structures.filter_interaction import (
    FilterInteraction,
)
from backend.inference_core.reapply.data_structures.plot_interaction import (
    AddPlotInteraction,
)
from backend.inference_core.reapply.data_structures.point_selection_interaction import (
    PointSelectionInteraction,
)
from backend.inference_core.reapply.data_structures.record import Record
from backend.inference_core.reapply.data_structures.select_prediction_interaction import (
    SelectPredictionInteraction,
)
from backend.inference_core.reapply.data_structures.types import (
    BrushAction,
    InteractionType,
)
from backend.utils.hash import getUIDForString

app = None


def init_firebase():
    global app
    if app:
        return app
    else:
        cred = credentials.Certificate("backend/inference_core/reapply/cred.json")
        app = firebase_admin.initialize_app(
            cred, {"databaseURL": "https://reusing-intent-default-rtdb.firebaseio.com"}
        )

    return app


class Workflow:
    def __init__(self, id, interactions, name, **kwargs):
        self.id = id
        self._name = name

        def f(x) -> Any:
            del x["id"]
            return x

        self.raw = interactions

        self.interactions = list(map(lambda x: GenericInteraction(f(x)), interactions))

    @property
    def name(self):
        return self._name

    def apply(self, target: pd.DataFrame, label: str):
        target = target.set_index(
            target.apply(lambda row: getUIDForString(str(row[label])), axis=1)
        )
        target.reset_index(level=0, inplace=True)
        target.rename(columns={"index": "id"}, inplace=True)

        records = []

        for idx, interaction in enumerate(self.interactions):
            parent_record = Record()
            if idx > 0:
                parent_record = deepcopy(records[idx - 1])

            int_type = interaction.type

            if int_type == InteractionType.ADD_PLOT:
                inter = AddPlotInteraction(**self.raw[idx])
                parent_record.update_plot(inter.plot)
            elif int_type == InteractionType.POINT_SELECTION:
                inter = PointSelectionInteraction(**self.raw[idx])
                parent_record.add_point_selection(inter.plot, inter.selected)
            elif int_type == InteractionType.BRUSH:
                interaction = BrushInteraction(**self.raw[idx])
                action = interaction.action
                if action == BrushAction.ADD:
                    parent_record.add_brush(interaction.plot, interaction.brush, target)
                elif action == BrushAction.UPDATE:
                    parent_record.update_brush(
                        interaction.plot, interaction.brush, target
                    )
                elif action == BrushAction.REMOVE:
                    parent_record.remove_brush(interaction.plot, interaction.brush_id)
            elif int_type == InteractionType.SELECT_PREDICTION:
                interaction = SelectPredictionInteraction(**self.raw[idx])
                parent_record.set_prediction(interaction.prediction, target, "")
            elif int_type == InteractionType.FILTER:
                interaction = FilterInteraction(**self.raw[idx])
                parent_record.set_filter(interaction.filterType)

            records.append(parent_record)

        datasets = []
        for rec in records:
            data = rec.apply(target)
            datasets.append(data)

        return datasets[-1]


class Reapply:
    def __init__(self):
        init_firebase()
        self._workflows: Dict[str, Workflow] = {}

    def add_workflow(self, id: str):
        ref = db.reference(id)
        workflow: Any = ref.get()
        self._workflows[id] = Workflow(**workflow)
        return self._workflows[id]

    @property
    def workflows(self):
        return list(self._workflows.values())
