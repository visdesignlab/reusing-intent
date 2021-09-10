import hashlib

import pandas as pd


def getUIDForString(toHash: str):
    md5 = hashlib.md5(toHash.encode())
    return md5.hexdigest()


def get_hash_for_dataset(df: pd.DataFrame):
    iid = df.iid.sort_values()
    iid = "_".join(iid.tolist())

    md5Hash = hashlib.md5(iid.encode())
    blake2b = hashlib.blake2b(iid.encode())

    hash_str = f"{md5Hash.hexdigest()}-{blake2b.hexdigest()}"

    return hash_str
