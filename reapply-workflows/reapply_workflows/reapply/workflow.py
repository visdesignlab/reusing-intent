import hashlib
from typing import Dict, List, Optional

import pandas as pd
from reapply_workflows.reapply.Graph import Graph


def getUIDForString(toHash: str):
    md5 = hashlib.md5(toHash.encode())
    return md5.hexdigest()


def add_ids(data: pd.DataFrame, label: str):
    data = data.copy()

    data = data.round(5)

    sorted_columns = sorted(data.columns)
    data = data[sorted_columns]

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

    col = data.pop(label)
    data.insert(2, label, col)  # type: ignore

    return data


def get_hash_for_dataset(df: pd.DataFrame):
    iid = df.iid.sort_values()
    iid = "_".join(iid.tolist())

    md5Hash = hashlib.md5(iid.encode())
    blake2b = hashlib.blake2b(iid.encode())

    hash_str = f"{md5Hash.hexdigest()}-{blake2b.hexdigest()}"

    return hash_str


class Workflow:
    def __init__(self, id, name, project_name, project, graph: Dict, order, **kwargs):
        self.id = id
        self.name = name
        self.project_name = project_name
        self.order = order
        self.type = kwargs["type"]
        self.project = project
        self.graph = Graph(**graph)

    def describe(self):
        print(self.name)
        print(self.graph.ascii_graph())

    def apply(self, data: pd.DataFrame, label: Optional[str] = None):
        if label is None:
            df = data.copy(deep=True)
            row_count = df.shape[0]
            col_count = df.nunique()
            unique_cols = col_count[
                col_count == row_count
            ].index.tolist()  # type:ignore
            df_types = df[unique_cols].dtypes
            pot_labels: List[str] = df_types[df_types == object].index.tolist()  # type: ignore # noqa
            if len(pot_labels) == 0:
                raise Exception(
                    "No unique label column, please add unique label column"
                )
            if len(pot_labels) > 1:
                print("More than one potential label columns found.")
                print(
                    f"Please specify the correct one for accurate results. Currently using {pot_labels[0]}"  # noqa
                )
            label = pot_labels[0]

        data = add_ids(data, label)
        dataset_id = get_hash_for_dataset(data)
        return self.graph.apply(data, dataset_id)
