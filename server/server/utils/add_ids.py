import pandas as pd

from .hash import getUIDForString


def add_ids(data: pd.DataFrame, label: str):
    data = data.copy()

    data = data.round(5)

    # Add ids which change on row label change
    data.set_index(
        data.apply(lambda row: getUIDForString(str(row[label])), axis=1),
        inplace=True,
        verify_integrity=True,
    )

    data.reset_index(level=0, inplace=True)
    data.rename(columns={"index": "id"}, inplace=True)

    # Add iids which change on value change
    data.set_index(
        data.apply(
            lambda row: getUIDForString("_".join(row.values.astype(str))), axis=1
        ),
        inplace=True,
        verify_integrity=True,
    )

    data.reset_index(level=0, inplace=True)
    data.rename(columns={"index": "iid"}, inplace=True)

    return data
