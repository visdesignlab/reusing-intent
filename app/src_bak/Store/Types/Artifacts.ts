export type Status = 'Accepted' | 'Rejected' | 'Unknown';

export type StatusRecord = {
  original_dataset: string | null;
  status_record: { [key: string]: Status };
};
