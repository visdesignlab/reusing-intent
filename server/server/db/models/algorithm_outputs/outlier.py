from .intent_base import IntentBase


class OutlierBase(IntentBase):
    __abstract__ = True

    @property
    def intent(self):
        return "Outlier"


class DBScanOutlier(OutlierBase):
    @property
    def algorithm(self):
        return "DBScan"


class IsolationForestOutlier(OutlierBase):
    @property
    def algorithm(self):
        return "IsolationForest"
