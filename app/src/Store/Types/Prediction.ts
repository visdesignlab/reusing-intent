export type KMeansInfo = {
  params: {
    n_clusters: number;
  };
  selected_center: number[];
  centers: [number, number][];
  hull: [number, number][];
};

export type DBScanInfo = {
  hull: [number, number][];
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
  description: string;
  memberIds: string[];
  dimensions: string[];
  info: AlgorithmInfo;
  hash: string;
  membership: {
    ipns: string[];
    isnp: string[];
    matches: string[];
  };
};

export type Predictions = Prediction[];
