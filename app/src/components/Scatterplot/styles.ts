import { makeStyles } from '@material-ui/core';

import { IPNS, ISNP, MATCHES, NON_UNION, UNION, AGG, FIRST_LABEL, SECOND_LABEL, THIRD_LABEL, FOURTH_LABEL, FIFTH_LABEL, } from '../ColorSpecs';

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
  aggregatePoint: {
    fill: `${AGG} !important`,
  },
  hoveredAgg: {
    opacity: `0.5 !important`,
  },
  normalAgg: {
    opacity: `1.0 !important`,
  },
  firstLabel: {
    fill: `${FIRST_LABEL} !important`,
  },
  secondLabel: {
    fill: `${SECOND_LABEL} !important`,
  },
  thirdLabel: {
    fill: `${THIRD_LABEL} !important`,
  },
  fourthLabel: {
    fill: `${FOURTH_LABEL} !important`,
  },
  fifthLabel: {
    fill: `${FIFTH_LABEL} !important`,
  },

  normalLine: {
    opacity: 0.2,
    stroke: 'grey',
    strokeWidth: '2',
  },
  hoverLine: {
    opacity: 0.5,
    stroke: 'blue',
    strokeWidth: '4',
  },
  selectedLine: {
    stroke: 'blue',
    opacity: 0.5,
    strokeWidth: '2',
  },
});

export default useScatterplotStyle;
