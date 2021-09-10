import Axios from 'axios';

import { DATA } from '../..';
import { Data } from '../types/Dataset';

export const queryData = async (rid: string) => {
  const { data } = await Axios.get<Data>(`${DATA}/${rid}`);

  return data;
};
