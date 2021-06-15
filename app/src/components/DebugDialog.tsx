import { FormControlLabel, FormGroup, Switch, TextField } from '@material-ui/core';
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
        <TextField
          label="Default Route"
          value={opts.defaultRoute ? opts.defaultRoute : ''}
          onChange={(e) => setDebugOpts({ defaultRoute: e.target.value })}
        />
      </FormGroup>
      <pre>{JSON.stringify(opts, null, 4)}</pre>
    </>
  );
};

export default observer(DebugDialog);
