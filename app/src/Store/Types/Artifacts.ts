type Status = 'Accepted' | 'Rejected' | 'Unknown';

export type StatusRecord = {
  original_dataset: string | null;
  status_record: { [key: string]: Status };
};

// export type Artifact = {
//   version_status: StatusRecord;
// };

// export const DefaultArtifact: Artifact = {
//   version_status: {
//     original_dataset: null,
//     status_record: {},
//   },
// };
