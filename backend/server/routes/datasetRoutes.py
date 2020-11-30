import os
from typing import Any, Dict, List

import pandas as pd
import yaml
from flask import Blueprint, jsonify

datasetRoute = Blueprint("dataset", __name__)

datasetRoot = os.path.abspath("./datasets")

datasetDict = {}


def print_string(s: str) -> None:
    print(s)


def filter_dict(keys: List[str], old_obj: Dict[str, Any]) -> Dict[str, Any]:
    return {key: old_obj[key] for key in keys}


def listAllDatasets():
    for base, _, files in os.walk(datasetRoot):
        for file in files:
            if file.endswith(".yml"):
                completeFilename = os.path.join(base, file)
                with open(completeFilename, "r") as f:
                    datasetConfig = yaml.load(f, Loader=yaml.FullLoader)
                    datasetConfig["config_path"] = os.path.join(base, completeFilename)
                    datasetConfig["path"] = os.path.join(
                        base, datasetConfig["file_name"]
                    )
                    datasetDict[datasetConfig["id"]] = datasetConfig


@datasetRoute.route("/datasets", methods=["GET"])
def getAllDatasets() -> Any:
    datasets: List[Any] = []
    keys = ["id", "dataset_name"]
    for _, v in datasetDict.items():
        info = filter_dict(keys, v)
        datasets.append(info)
    return jsonify(datasets)


@datasetRoute.route("/dataset/<id>", methods=["GET"])
def getDatasetById(id):
    if id not in datasetDict:
        return "Dataset does not exist", 500
    config = datasetDict[id]
    data = pd.read_csv(config["path"])
    data = list(data.T.to_dict().values())
    keys = ["id", "dataset_name", "label_column", "columns"]
    dataset = filter_dict(keys, config)
    dataset["data"] = data
    return jsonify(dataset)
