import os

from ..paths import DATABASE_ROOT


def getDatabasePath(id):
    return os.path.join(DATABASE_ROOT, f"{id}.db")
