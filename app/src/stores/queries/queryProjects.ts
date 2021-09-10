import Axios from 'axios';

import { PROJECT } from '../..';
import { Project } from '../types/Project';

export const queryProjects = async () => {
  const { data } = await Axios.get<Project[]>(`${PROJECT}/all`);

  return data;
};
