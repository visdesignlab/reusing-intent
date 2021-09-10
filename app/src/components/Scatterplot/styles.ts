import { makeStyles } from '@material-ui/core';

import { IPNS, ISNP, MATCHES, NON_UNION, UNION } from '../../utils/ColorSpec';

const useScatterplotStyle = makeStyles({
  newColor: {
    stroke: 'blue !important',
    fill: 'blue !important',
  },
  removedColor: {
    stroke: 'red !important',
  },
  newMark: {
    strokeWidth: '1',
    fill: 'black',
    opacity: 0.5,
  },
  removedMark: {
    stroke: 'none',
    strokeWidth: '0.5',
    strokeLinecap: 'round',
    opacity: 0.5,
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
    fill: 'black',
    opacity: 0.5,
  },
  regularMark: {
    fill: 'black',
  },
  regularLine: {
    stroke: 'black',
    strokeOpacity: 0.2,
  },
  nonUnionMark: {
    fill: NON_UNION,
  },
  unionMark: {
    fill: UNION,
    stroke: UNION,
  },
  unionLine: {
    stroke: UNION,
    strokeOpacity: 0.8,
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
  dullMark: {
    opacity: 0.2,
  },
  forceDullMark: {
    opacity: '0.1 !important',
  },
});

export default useScatterplotStyle;
