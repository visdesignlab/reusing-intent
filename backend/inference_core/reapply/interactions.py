from enum import Enum


###########################################################################
############################### Interactions ##############################
###########################################################################
class Interactions(Enum):
    ADD_PLOT = "AddPlot"
    BRUSH = "Brush"
    TOGGLE_CATEGORY = "ToggleCategory"
    CHANGE_CATEGORY = "Change_Category"
    SELECT_PREDICTION = "SelectPrediction"
    POINT_SELECTION = "PointSelection"


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
