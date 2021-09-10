def jaccard_similarity(l1, l2):
    s1 = set(l1)
    s2 = set(l2)

    inter = s1.intersection(s2)
    union = s1.union(s2)

    if len(union) == 0:
        return 0

    return len(inter) / len(union)
