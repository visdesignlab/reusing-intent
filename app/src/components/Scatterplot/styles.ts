import { makeStyles } from '@material-ui/core';

import { IPNS, ISNP, MATCHES, NON_UNION, UNION } from '../ColorSpecs';

const useScatterplotStyle = makeStyles({
  newColor: {
    stroke: 'blue !important',
    fill: 'blue !important'
  },
  removedColor: {
    stroke: 'red !important',
  },
  newMark: {
    strokeWidth: '1',
    fill: 'black',
  },
  removedMark: {
    stroke: 'black',
    strokeWidth: '3',
    strokeLinecap: 'round',
    fill: 'black',
  },
  movedLine: {
    opacity: '0.2 !important',
    stroke: 'black',
    fill: 'black',
    strokeWidth: '1',
    strokeLinecap: 'round',
  },
  movedPoint: {
    fill: 'gray !important',
  },
  regularMark: {
    fill: 'black',
  },
  nonUnionMark: {
    fill: NON_UNION,
  },
  unionMark: {
    fill: UNION,
    stroke: UNION,
  },
  regularForceMark: {
    fill: 'black !important',
    opacity: 0.2,
  },
  intermittentHighlight: {
    fill: 'red',
  },
  matches: {
    fill: `${MATCHES} !important`,
    opacity: 1,
  },
  isnp: {
    fill: `${ISNP} !important`,
    opacity: 1,
  },
  ipns: {
    fill: `${IPNS} !important`,
    opacity: 1,
  },
});

export default useScatterplotStyle;
