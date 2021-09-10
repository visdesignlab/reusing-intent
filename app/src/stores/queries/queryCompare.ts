import Axios from 'axios';

import { COMPUTE } from '../..';
import { CompareData } from '../ExploreStore';
import { DataPoint } from '../types/Dataset';

export const queryCompare = async <T>(base: DataPoint[], target: DataPoint[], provenance: T) => {
  const { data } = await Axios.post<CompareData>(`${COMPUTE}/compare`, {
    base,
    target,
    provenance,
  });

  return data;
};
