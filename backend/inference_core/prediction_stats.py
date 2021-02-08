def getStats(members, sels):
    stats = {
        "ipns": list(set(members) - set(sels)),
        "isnp": list(set(sels) - set(members)),
        "matches": list(set(sels).intersection(set(members))),
    }
    return stats
