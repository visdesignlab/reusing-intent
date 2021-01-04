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
  regularForceMark: {
    fill: 'black !important',
    opacity: 0.2,
  },
  intermittentHighlight: {
    fill: 'red',
  },
  matches: {
    fill: '#9dab86 !important',
    opacity: 1,
  },
  isnp: {
    fill: '#db6400 !important',
    opacity: 1,
  },
  ipns: {
    fill: '#fdb827 !important',
    opacity: 1,
  },
});

export default useScatterplotStyle;
