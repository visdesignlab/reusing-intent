import { LinearProgress, List, ListItem, ListItemText } from '@material-ui/core';
import Axios from 'axios';
import { observer } from 'mobx-react';
import { FC, useEffect, useState } from 'react';

import { SERVER } from '../../consts';

import { ID } from './UploadDatasetDialog';

type Props = {
  trackers: ID[];
  updateWhenDone: () => void;
};

type Status = {
  type: string;
  status: string;
  info: {
    processed: number;
    to_process: number;
  };
};

const StatusBars: FC<Props> = ({ trackers, updateWhenDone }: Props) => {
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    if (trackers.length === 0) return;

    if (complete) {
      setStatuses([]);
      updateWhenDone();
    }

    const intervalId = setInterval(() => {
      Axios.post(`${SERVER}/dataset/status`, { trackers }).then((response) => {
        const stats: Status[] = response.data;
        const isAllDone = stats.map((s) => s.status).filter((s) => s !== 'SUCCESS').length === 0;

        if (isAllDone) setComplete(true);
        setStatuses(stats);
      });
    }, 500);

    return () => clearInterval(intervalId);
  }, [trackers, statuses, complete, updateWhenDone]);

  return (
    <List>
      {statuses.map(({ type, info: { processed, to_process } }) => (
        <ListItem key={type}>
          <ListItemText>
            {type} ({processed}/{to_process})
          </ListItemText>
          <ListItemText>
            <LinearProgress value={(processed / to_process) * 100} variant="determinate" />
          </ListItemText>
        </ListItem>
      ))}
    </List>
  );
};

export default observer(StatusBars);
