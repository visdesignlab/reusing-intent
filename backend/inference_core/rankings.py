import numpy as np
from scipy.spatial.distance import jaccard


def rank_jaccard(intent: np.ndarray, selection: np.ndarray) -> float:
    return float(1 - jaccard(intent, selection))
