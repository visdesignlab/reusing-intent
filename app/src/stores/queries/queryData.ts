import { gql } from '@apollo/client';

import { apolloClient } from '../..';
import { ColumnResult, DataResult } from '../types/Dataset';

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

const COLUMN_META_QUERY = gql`
  query columns($record_id: ID!) {
    data(record_id: $record_id) {
      errors
      success
      columnInfo
      numericColumns
      categoricalColumns
      labelColumn
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

export function queryColumns(record_id: string) {
  return apolloClient.query<ColumnResult>({
    query: COLUMN_META_QUERY,
    variables: { record_id },
  });
}
