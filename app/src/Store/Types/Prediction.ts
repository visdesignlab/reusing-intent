export type KMeansInfo = {
  params: {
    n_clusters: number;
  };
  selected_center: number[];
};

export type DBScanInfo = {
  params: {
    eps: number;
    min_samples: number;
  };
};

export type LinearRegressionInfo = {
  threshold: number;
  coeff: number[];
  intercept: number;
};

export type AlgorithmInfo = KMeansInfo | DBScanInfo | LinearRegressionInfo;

export type Algorithms = 'KMeans' | 'DBScan' | 'LR';

export type Intents = 'Cluster' | 'Outlier' | 'NonOutlier' | 'LR:within' | 'LR:outside';

export type Prediction = {
  rank: number;
  intent: Intents;
  algorithm: Algorithms;
  memberIds: string[];
  dimensions: string[];
  info: AlgorithmInfo;
  stats: {
    ipns: string[];
    isnp: string[];
    matches: string[];
  };
};

export type Predictions = Prediction[];
