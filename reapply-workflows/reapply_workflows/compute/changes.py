import pandas as pd


class Change:
    def __init__(self, added=[], removed=[], updated=[], updateMap=[], results=[]):
        self.added = added
        self.removed = removed
        self.updated = updated
        self.updateMap = updateMap
        self.results = results

    def toJSON(self):
        return self.__dict__


def get_changes_selections(base, target, base_selections, target_selections):
    complete_sels = []
    complete_sels.extend(base_selections)
    complete_sels.extend(target_selections)

    added = target[
        ~target.id.isin(base.id) & target.id.isin(target_selections)
    ].id.tolist()

    removed = base[base.id.isin(base_selections) & ~base.id.isin(target.id)].id.tolist()

    combined_df = pd.merge(base, target, how="outer", left_on="id", right_on="id")
    changes = combined_df[combined_df.iid_x != combined_df.iid_y]
    changes = changes[changes.id.isin(complete_sels)].dropna().id.tolist()

    update_map = get_change_map(base, target, changes)

    return Change(added, removed, changes, update_map, target_selections)


def get_changes_df(base, updated):
    added = updated[~updated.id.isin(base.id)].id.tolist()
    removed = base[~base.id.isin(updated.id)].id.tolist()

    combined_df = pd.merge(base, updated, how="outer", left_on="id", right_on="id")
    changes = combined_df[combined_df.iid_x != combined_df.iid_y]
    changes = changes.dropna().id.tolist()

    updateMap = get_change_map(base, updated, changes)

    return Change(added, removed, changes, updateMap)


def get_changes_point_selection(base, updated, selections):
    removed = base[~base.id.isin(updated.id) & base.id.isin(selections)].id.tolist()

    return Change([], removed, [], [])


def get_change_map(base, target, changes):
    updateMap = []

    for cid in changes:
        updateMap.append(
            {
                "id": cid,
                "source": base[base.id == cid].iid.tolist()[0],
                "target": target[target.id == cid].iid.tolist()[0],
            }
        )

    return updateMap
