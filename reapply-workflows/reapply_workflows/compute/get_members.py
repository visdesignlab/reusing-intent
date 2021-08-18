from typing import List

import pandas as pd
from reapply_workflows.compute.kmeans_cluster import kmeans_cluster


def get_members(
    data: pd.DataFrame, dimensions: List[str], intent, algorithm, params, info
):
    print(intent, algorithm)
    if intent == "Cluster":
        if algorithm == "KMeans":
            clf = kmeans_cluster(
                data[dimensions].values, params["n_clusters"], init_centers="k-means++"
            )
            selected = data[clf.labels_ == 1].id
            return selected.tolist()

    return str(data.shape[0])
