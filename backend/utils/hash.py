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


def getUIDForPandasRow(row):
    return pd.util.hash_pandas_object(row, index=False)  # type: ignore
