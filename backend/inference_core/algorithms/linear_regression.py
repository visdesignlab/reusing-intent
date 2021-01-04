import pandas as pd


def get_params():
    return [0.05, 0.08, 1]


def computeLR(data: pd.DataFrame):
    print("Test")
    # thresholds = get_params()
    # vs = data.values
    # numDims = np.size(vs, 1)

    # X = vs[:, 0 : numDims - 1]
    # y = vs[:, numDims - 1].reshape(-1, 1)

    # X_scaled = robustScaler(X)
    # y_scaled = robustScaler(y).flatten()

    # for threshold in thresholds:
    #     lr = LinearRegression()
