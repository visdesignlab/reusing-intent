import { gql } from '@apollo/client';

import { apolloClient } from '../..';

import { CategoryResult } from './../types/Project';

const ADD_CATEGORY = gql`
  mutation add_category_column($projectId: ID!, $columnName: String!, $options: String!) {
    addCategoryColumn(projectId: $projectId, columnName: $columnName, options: $options) {
      errors
      success
    }
  }
`;

export function addCategory(projectId: string, columnName: string, options: string) {
  return apolloClient.mutate<CategoryResult>({
    mutation: ADD_CATEGORY,
    variables: { projectId, columnName, options },
  });
}
