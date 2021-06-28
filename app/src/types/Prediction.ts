// Modify reapply-workflows/reapply_workflows/inference/prediction.py in conjunction

type Intent =
  | 'Cluster'
  | 'Outlier'
  | 'Linear Regression'
  | 'Polynomial Regression'
  | 'Multivariate Optimization';

type Algorithm =
  | 'Polynomial Features + TheilSenRegressor'
  | 'TheilSenRegressor'
  | 'KMeans'
  | 'DBScan'
  | 'Isolation Forest'
  | 'BNL';

type Info = { [key: string]: unknown };

type Params = { [key: string]: unknown };

type PredictionStats = {
  ipns: string[];
  isnp: string[];
  matches: string[];
};

export type Prediction = {
  intent: Intent;
  algorithm: Algorithm;
  info: Info;
  params: Params;
  rank_jaccard: number;
  rank_auto_complete: number;
  rank_nb: number;
  dimensions: string[];
  members: string[];
  membership_stats: PredictionStats;
};
