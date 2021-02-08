from typing import Any

import numpy as np
import pandas as pd

from backend.inference_core.algorithms.kmeans import kmeans
from backend.inference_core.utils import robustScaler2


def applyKMeans(data: pd.DataFrame, dimensions, n_clusters, original_center):
    scaler = robustScaler2(data[dimensions].values)
    scaled_data = scaler.transform(data[dimensions].values)

    labels, centers, _ = kmeans(scaled_data, n_clusters)
    centers: Any = scaler.inverse_transform(centers)
    distances = np.linalg.norm(centers - original_center, axis=1)
    closest_center_idx = np.argmin(distances)
    closest_center = list(centers[closest_center_idx, :])

    mask = np.array(labels)
    mask[mask != closest_center_idx] = 0
    mask[mask == closest_center_idx] = 1

    ids = data[mask.astype(bool)].id

    return ids, closest_center
