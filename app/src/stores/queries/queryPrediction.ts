import Axios from 'axios';

import { Prediction } from '../../types/Prediction';
import { DataPoint } from '../types/Dataset';

import { PREDICT } from './../../index';

export async function queryPrediction(
  _data: DataPoint[],
  dimensions: string[],
  selections: string[],
) {
  if (selections.length === 0) return [];

  const { data } = await Axios.post<Prediction[]>(`${PREDICT}/`, {
    data: _data,
    dimensions,
    selections,
  });

  return data;
}
