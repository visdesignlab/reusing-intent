import pandas as pd

from backend.utils.hash import getUIDForString


def format_dataset(df: pd.DataFrame, label: str):
    df = df.copy()

    df.set_index(
        df.apply(lambda row: getUIDForString(str(row[label])), axis=1),
        inplace=True,
        verify_integrity=True,
    )

    df.reset_index(level=0, inplace=True)
    df.rename(columns={"index": "id"}, inplace=True)

    df["id"] = df["id"].astype(str)  # type: ignore

    df.set_index(
        df.apply(lambda row: getUIDForString("_".join(row.values.astype(str))), axis=1),
        inplace=True,
        verify_integrity=True,
    )

    df.reset_index(level=0, inplace=True)
    df.rename(columns={"index": "iid"}, inplace=True)
    df["iid"] = df["iid"].astype(str)  # type: ignore

    return df
