from .intent_base import IntentBase


class OutlierBase(IntentBase):
    __abstract__ = True

    @property
    def results(self):
        output = map(int, self.output.split(","))
        return list(output)

    @property
    def intent(self):
        return "Outlier"


class DBScanOutlier(OutlierBase):
    @property
    def results(self):
        output = map(int, self.output.split(","))
        return list(output)

    @property
    def algorithm(self):
        return "DBScan"


class IsolationForestOutlier(OutlierBase):
    @property
    def algorithm(self):
        return "IsolationForest"
