/* eslint-disable @typescript-eslint/no-explicit-any */
// Modify reapply-workflows/reapply_workflows/inference/prediction.py in conjunction

type IntentType =
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

type PredictionStats = {
  ipns: string[];
  isnp: string[];
  matches: string[];
};

export type Prediction = {
  intent: IntentType;
  algorithm: Algorithm;
  info: any;
  hash: string;
  params: any;
  rank_jaccard: number;
  rank_auto_complete: number;
  rank_nb: number;
  dimensions: string[];
  members: string[];
  membership_stats: PredictionStats;
};

export type Intent = Pick<Prediction, 'intent' | 'algorithm' | 'params' | 'dimensions' | 'info'>;

export function predictionToIntent({
  intent,
  algorithm,
  info,
  params,
  dimensions,
}: Prediction): Intent {
  return { intent, algorithm, params, dimensions, info };
}

export type PredictionResult = {
  success: boolean;
  errors: string[];
  predictions: Prediction[];
};
