from enum import Enum


###########################################################################
############################### Brush Action ##############################
###########################################################################
class BrushAction(Enum):
    ADD = "Add"
    UPDATE = "Update"
    REMOVE = "Remove"


###########################################################################
############################### Interactions ##############################
###########################################################################
class InteractionType(Enum):
    ADD_PLOT = "AddPlot"
    BRUSH = "Brush"
    SELECT_PREDICTION = "SelectPrediction"
    POINT_SELECTION = "PointSelection"
    FILTER = "Filter"
    NONE = "None"


###########################################################################
################################ Algorithms ###############################
###########################################################################
class Algorithms(Enum):
    KMEANS = "KMeans"
    DBSCAN = "DBScan"
    BNL = "BNL"
    DT = "DT"
    LR = "LR"
    QR = "QR"


###########################################################################
################################# Intents #################################
###########################################################################
class Intents(Enum):
    CLUSTER = "Cluster"
    OUTLIER = "Outlier"
    SKYLINE = "Skyline"
    RANGE = "Range"
    LINEARREGRESSION = "LINEARREGRESSION"
    QUADRATICREGRESSION = "QUADRATICREGRESSION"
