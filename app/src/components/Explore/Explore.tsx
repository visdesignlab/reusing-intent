import { observer } from 'mobx-react';
import React, { FC, useContext, useEffect } from 'react';
import { Redirect, RouteComponentProps } from 'react-router-dom';

import Store from '../../Store/Store';

import ExploreHome from './ExploreHome';

const Explore: FC<RouteComponentProps> = ({ location }: RouteComponentProps) => {
  const {
    setQueryParams,
    projectStore: { loadedDataset },
  } = useContext(Store);

  useEffect(() => {
    setQueryParams(location.search);
  }, [location.search, setQueryParams]);

  if (!loadedDataset) return <Redirect to={{ pathname: '/project', search: location.search }} />;

  return <ExploreHome />;
};

export default observer(Explore);
