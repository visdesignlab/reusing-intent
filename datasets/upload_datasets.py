import os
import sys
import threading
import time

import requests
from tqdm import tqdm

ROOT = os.path.abspath("datasets")

subdirs = os.walk(ROOT)

api = "http://localhost"


def main(projects=[]):
    req = empty_database()
    if req.status_code != 200:
        raise Exception("Cannot empty database")
    print()
    print("Database cleared succesfully!")
    print()
    for dir in tqdm(next(subdirs)[1], desc="Projects"):
        if dir.startswith("_"):
            continue
        dataset_dir = os.path.join(ROOT, dir)
        name = dir
        id = get_project_id(dir)

        if len(projects) > 0 and id not in projects:
            continue

        req = create_project(name, id)
        if req.status_code != 200:
            raise Exception(f"Error adding {name}")
        meta_path = next(filter(lambda x: x.endswith(".yml"), os.listdir(dataset_dir)))
        meta_path = os.path.join(dataset_dir, meta_path)

        csv_files = filter(lambda x: x.endswith(".csv"), os.listdir(dataset_dir))

        version = 1

        threads = []

        for file in csv_files:
            file = os.path.join(dataset_dir, file)
            print(name)
            th = threading.Thread(
                target=upload_dataset, args=[file, meta_path, id, str(version)]
            )
            th.start()
            threads.append(th)
            time.sleep(1)
            version += 1
            print()
            print()


def upload_dataset(file_path: str, meta_path: str, project: str, version: str):
    values = {"version": f"v{version}", "description": ""}
    files = {
        "dataset": open(file_path, "rb"),
        "metadata": open(meta_path, "rb"),
    }
    req = requests.post(f"{api}/{project}/dataset/", files=files, data=values)
    response = req.json()
    trackers = response["trackers"]

    isOn = True

    progress = {}
    bars = {}

    while isOn:
        treq = requests.post(f"{api}/dataset/status", json={"trackers": trackers})
        tres = treq.json()

        for tracker in tres:
            name = tracker["type"]
            info = tracker["info"]
            if not info or "processed" not in info:
                continue
            processed = info["processed"]
            to_process = info["to_process"]
            status = tracker["status"]
            progress[name] = status.lower() == "success"
            if name not in bars:
                bars[name] = tqdm(total=to_process, desc=name)
            bar = bars[name]
            bar.update(processed - bar.n)

        status = len(list(progress.values())) > 0 and all(list(progress.values()))

        if status:
            for v in bars.values():
                v.update(v.total - v.n)
            isOn = False
        time.sleep(0.1)


def create_project(name, id):
    req = requests.post(f"{api}/project/{id}", {"name": name})
    return req


def empty_database():
    return requests.get(f"{api}/clearall")


def get_project_id(dir: str):
    dir = dir.replace(" ", "_")
    dir = dir.lower()
    return dir


if __name__ == "__main__":
    projects = []
    if len(sys.argv) > 1:
        projects = sys.argv[1:]
    main(projects)
