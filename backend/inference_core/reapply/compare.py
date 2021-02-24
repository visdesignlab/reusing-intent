from typing import List

import pandas as pd

from backend.inference_core.reapply.data_structures.apply_results import Changes


def get_changes_df(base: pd.DataFrame, updated: pd.DataFrame):
    added = updated[~updated.id.isin(base.id)].id.tolist()

    removed = base[~base.id.isin(updated.id)].id.tolist()

    combined = pd.merge(base, updated, how="outer", left_on="id", right_on="id")
    changes = combined[combined.iid_x != combined.iid_y]
    changes = changes.dropna().id.tolist()

    result = updated.id.tolist()

    return Changes(added=added, removed=removed, changed=changes, result=result)


def get_changes_point_selection(
    base: pd.DataFrame, updated: pd.DataFrame, selections: List[str]
):
    removed = base[~base.id.isin(updated.id) & base.id.isin(selections)].id.tolist()

    result = list(filter(lambda x: x not in removed, selections))

    return Changes(added=[], removed=removed, changed=[], result=result)


def get_similarity(l1, l2):
    intersection = len(set(l1).intersection(set(l2)))
    union = len(set(l1)) + len(set(l2)) - intersection

    return intersection / union


def get_changes_brush(base, updated, plot, brushId, type):
    brush = plot.brushes.get_brush(brushId)

    mask = brush.get_brush_mask(updated[plot.dimensions].values)
    ids = updated.loc[mask].id
    changes = get_changes_df(
        base[base.id.isin(brush.points)], updated[updated.id.isin(ids)]
    )

    return Changes(
        **changes.serialize(),
        **{"plot_id": plot.id, "brush_id": brush.id, "type": type}
    )
