import hashlib

import pandas as pd


def getUIDForFile(file) -> str:
    md5Hash = hashlib.md5()
    blake2b = hashlib.blake2b()
    for chunk in iter(lambda: file.read(8192), b""):
        md5Hash.update(chunk)
        blake2b.update(chunk)
    file.seek(0)
    return f"{md5Hash.hexdigest()}-{blake2b.hexdigest()}"


def getUIDForString(toHash: str):
    md5 = hashlib.md5(toHash.encode())
    return md5.hexdigest()


def get_hash_for_dataset(df: pd.DataFrame):

    iid = df.iid.sort_values()
    iid = "_".join(iid.tolist())

    md5Hash = hashlib.md5(iid.encode())
    blake2b = hashlib.blake2b(iid.encode())

    iid = f"{md5Hash.hexdigest()}-{blake2b.hexdigest()}"

    return iid
