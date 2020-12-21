import { makeStyles } from '@material-ui/core';

const useScatterplotStyle = makeStyles({
  regularMark: {
    fill: 'black',
  },
  nonUnionMark: {
    fill: 'rgb(44, 127, 184)',
  },
  unionMark: {
    fill: 'rgb(244,106,15)',
  },
  intermittentHighlight: {
    fill: 'red',
  },
});

export default useScatterplotStyle;
