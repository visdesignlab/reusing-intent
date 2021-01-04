/* eslint-disable @typescript-eslint/no-unused-vars */
import { Button, Input, InputLabel } from '@material-ui/core';
import Axios from 'axios';
import React, { useEffect, useState } from 'react';

const Upload = () => {
  const [csv, setCsv] = useState<any>(null);
  const [yaml, setYaml] = useState<any>(null);
  const [label, setLabel] = useState('');
  const [job, setJob] = useState('');
  const [status, setStatus] = useState<any>(null);

  const getStatus = async (id: string) => {
    if (job.length === 0) return;

    try {
      const status = (await Axios.get(`http://127.0.0.1:5000/check/${id}`)).data;
      setStatus(status);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      getStatus(job);
    }, 500);

    return () => clearInterval(interval);
  });

  return (
    <div>
      <InputLabel>
        <Input id="csv" type="file" hidden onChange={(e: any) => setCsv(e.target.files[0])} />
        CSV
      </InputLabel>
      <InputLabel>
        <Input id="yml" type="file" hidden onChange={(e: any) => setYaml(e.target.files[0])} />
        YAML
      </InputLabel>
      <InputLabel>
        <Input id="yml" type="text" value={label} onChange={(e) => setLabel(e.target.value)} />
        Label
      </InputLabel>
      <Button
        disabled={!csv && !yaml && label.length === 0}
        onClick={() => {
          const formData = new FormData();
          formData.append('file', csv);
          formData.append('columns', yaml);
          formData.append('label', label);
          Axios.post('http://127.0.0.1:5000/dataset/process', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }).then((resp) => {
            setJob(resp.data);
          });
        }}
      >
        Upload
      </Button>
      {status && <pre>{JSON.stringify(status, null, 2)}</pre>}
    </div>
  );
};

export default Upload;
