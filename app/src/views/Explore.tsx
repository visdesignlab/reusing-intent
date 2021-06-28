import { observer } from 'mobx-react';
import { Redirect } from 'react-router-dom';

import { useStore } from '../stores/RootStore';

const Explore = () => {
  const {
    projectStore: { dataset_id, data: d },
  } = useStore();

  if (!dataset_id) return <Redirect to="/project" />;

  return (
    <div>
      Explore - {dataset_id} - {d ? d.labelColumn : 'unknown'}
    </div>
  );
};

export default observer(Explore);
