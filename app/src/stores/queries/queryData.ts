import { gql } from '@apollo/client';

import { apolloClient } from '../..';
import { DataResult } from '../types/Dataset';

const DATASET_QUERY = gql`
  query data($record_id: ID!) {
    data(record_id: $record_id) {
      errors
      success
      columnInfo
      values
      numericColumns
      categoricalColumns
      labelColumn
      columns
    }
  }
`;

export const COLUMN_FRAGMENT = gql`
  query data($record_id: ID!) {
    data(record_id: $record_id) {
      errors
      success
      columnInfo
      categoricalColumns
      columns
    }
  }
`;

export function queryData(record_id: string) {
  return apolloClient.query<DataResult>({
    query: DATASET_QUERY,
    variables: { record_id },
  });
}
