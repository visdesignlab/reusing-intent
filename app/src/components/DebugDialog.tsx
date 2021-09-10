import { FormControlLabel, FormGroup, Switch } from '@material-ui/core';
import { observer } from 'mobx-react';

import { useStore } from '../stores/RootStore';

const DebugDialog = () => {
  const { opts, setDebugOpts } = useStore();

  return (
    <>
      <FormGroup>
        <FormControlLabel
          control={
            <Switch
              checked={opts.debug === 'on'}
              onChange={() => setDebugOpts({ debug: opts.debug === 'on' ? 'off' : 'on' })}
            />
          }
          label="Debug Mode"
        />
        <FormControlLabel
          control={
            <Switch
              checked={opts.goToExplore}
              onChange={() => setDebugOpts({ goToExplore: !opts.goToExplore })}
            />
          }
          label="Redirect To Explore"
        />
        <FormControlLabel
          control={
            <Switch
              checked={opts.showCategories}
              onChange={() => setDebugOpts({ showCategories: !opts.showCategories })}
            />
          }
          label="Show Categories"
        />
      </FormGroup>
      <pre>{JSON.stringify(opts, null, 4)}</pre>
    </>
  );
};

export default observer(DebugDialog);
