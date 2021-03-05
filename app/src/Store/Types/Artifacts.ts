import { Predictions } from './Prediction';

type Status = 'Accepted' | 'Rejected' | 'Unknown';

type StatusRecord = {
  original_dataset: string;
  status_record: { [key: string]: Status };
};

export type VersionStatus = {
  predictions: Predictions;
  version_status: StatusRecord;
};
