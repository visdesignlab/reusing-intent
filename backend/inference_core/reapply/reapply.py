from copy import deepcopy
from typing import Any, List

import numpy as np
import pandas as pd
from sklearn.cluster import KMeans


def get_rect_brush_selected_ids(df, x, y, extent):
    x1, x2, y1, y2 = extent.values()
    selector = (df[x] >= x1) & (df[x] <= x2) & (df[y] >= y1) & (df[y] <= y2)
    base_selected_ids = df.loc[selector, "id"]
    return base_selected_ids.tolist()


def get_changed_ids(base, updated):
    base_ids = base.loc[:, "id"].tolist()
    updated_ids = updated.loc[:, "id"].tolist()

    common_ids = list(set(base_ids).intersection(set(updated_ids)))

    base_iid = set(base[base["id"].isin(common_ids)]["iid"].tolist())
    updated_iid = set(updated[updated["id"].isin(common_ids)]["iid"].tolist())

    changed_iids = list(base_iid - updated_iid)
    changed_iids.extend(list(updated_iid - base_iid))
    changed_iids = list(set(changed_iids))

    changed_ids = base[base["iid"].isin(changed_iids)]["id"].tolist()

    return {
        "added": list(set(updated_ids) - set(base_ids)),
        "removed": list(set(base_ids) - set(updated_ids)),
        "changed": changed_ids,
    }


def compare_id_list(base, updated):
    base = set(base)
    updated = set(updated)

    return {"added": list(base - updated), "removed": list(updated - base)}


def reapply(base: pd.DataFrame, updated: pd.DataFrame, interactions: List[Any]):
    outputs: Any = {"base": [], "updated": []}

    for interaction in interactions:
        actionType = interaction["type"]
        base_interaction = deepcopy(interaction)
        print(actionType)
        if actionType == "AddPlot":
            outputs["base"].append(base_interaction)
            changes = get_changed_ids(base, updated)
            interaction["changes"] = changes
            outputs["updated"].append(interaction)
        if actionType == "Brush":
            outputs["base"].append(base_interaction)
            plot = interaction["plot"]
            brushes = plot["brushes"]
            x = plot["x"]
            y = plot["y"]
            for brushId, brush in brushes.items():
                extent = brush["extents"]
                updated_selected = get_rect_brush_selected_ids(updated, x, y, extent)
                changes = compare_id_list(brush["points"], updated_selected)
                interaction["plot"]["brushes"][brushId]["points"] = updated_selected
                interaction["plot"]["brushes"][brushId]["changes"] = changes

            outputs["updated"].append(interaction)
        if actionType == "SelectPrediction":
            outputs["base"].append(base_interaction)
            prediction = interaction["prediction"]
            algorithm = prediction["algorithm"]
            if algorithm == "KMeans":
                changes = apply_Kmeans(updated, prediction, prediction["memberIds"])
                interaction["prediction"] = changes
                outputs["updated"].append(interaction)
    return outputs


def apply_Kmeans(updated, prediction, base_selected):
    info = prediction["info"]
    params = info["params"]
    n_clusters = params["n_clusters"]
    dimensions = prediction["dimensions"]
    selected_center = info["selected_center"]
    subset = updated.loc[:, dimensions]
    classifier = KMeans(n_clusters=n_clusters)

    classifier.fit(subset)
    labels: Any = classifier.labels_
    centers = classifier.cluster_centers_

    dist = np.linalg.norm(centers - selected_center, axis=1)
    min_idx = np.argmin(dist)
    closest_center = list(centers[min_idx, :])
    selected_label = [True if x == min_idx else False for x in labels]

    selected_ids = updated.loc[selected_label, "id"].tolist()

    changes = compare_id_list(base_selected, selected_ids)

    return {"changes": changes, "center": closest_center}
