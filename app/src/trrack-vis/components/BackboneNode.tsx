/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
/* eslint-disable no-unused-vars */
import { Provenance, ProvenanceNode, StateNode, NodeID } from '@visdesignlab/trrack';
import React, { ReactChild, useState } from 'react';
import { Animate } from 'react-move';
import { Popup, Button, Icon } from 'semantic-ui-react';

import { BundleMap, OriginMap } from '../Utils/BundleMap';
import { EventConfig } from '../Utils/EventConfig';
import translate from '../Utils/translate';

import { treeColor } from './Styles';

type BackboneNodeProps<T, S extends string, A> = {
  prov: Provenance<T, S, A>;
  first: boolean;
  iconOnly: boolean;
  current: boolean;
  duration: number;
  node: StateNode<T, S, A>;
  radius: number;
  strokeWidth: number;
  textSize: number;
  setBookmark: any;
  bookmark: any;
  nodeMap: any;
  currentDataset: string;
  annotationOpen: number;
  setAnnotationOpen: any;
  exemptList: string[];
  setExemptList: any;
  bundleMap?: BundleMap;
  clusterLabels: boolean;
  editAnnotations: boolean;
  eventConfig?: EventConfig<S>;
  popupContent?: (nodeId: StateNode<T, S, A>) => ReactChild;
  annotationContent?: (nodeId: StateNode<T, S, A>) => ReactChild;
  approvedFunction: (id: NodeID) => void;
  nodeCreationMap: OriginMap;

  rejectedFunction: (id: NodeID) => void;
  expandedClusterList?: string[];
};

function BackboneNode<T, S extends string, A>({
  prov,
  first,
  iconOnly,
  current,
  node,
  duration,
  radius,
  strokeWidth,
  textSize,
  nodeMap,
  annotationOpen,
  bookmark,
  setAnnotationOpen,
  exemptList,
  setExemptList,
  bundleMap,
  eventConfig,
  popupContent,
  editAnnotations,
  annotationContent,
  approvedFunction, 
  rejectedFunction,
  currentDataset, 
  nodeCreationMap,
  expandedClusterList,
}: BackboneNodeProps<T, S, A>) {
  const padding = 25;

  const cursorStyle = {
    cursor: 'pointer',
  } as React.CSSProperties;

  const [annotateText, setAnnotateText] = useState(
    prov.getLatestAnnotation(node.id)?.annotation
      ? prov.getLatestAnnotation(node.id)?.annotation!
      : '',
  );

  const handleCheck = () => {
    const lastAnnotation = prov.getLatestAnnotation(node.id);

    if (lastAnnotation?.annotation !== annotateText.trim()) {
      prov.addAnnotation(annotateText, node.id);
      setAnnotationOpen(-1);
    }
  };

  const handleClose = () => {
    setAnnotateText(prov.getLatestAnnotation(node.id)?.annotation!);
    setAnnotationOpen(-1);
  };

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  const handleInputChange = () => {};

  // console.log(JSON.parse(JSON.stringify(node)));
  let glyph = (
    <circle
      className={treeColor(current)}
      r={radius}
      strokeWidth={strokeWidth}
      style={cursorStyle}
    />
  );

  // let backboneBundleNodes = findBackboneBundleNodes(nodeMap, bundleMap)

  let dropDownAdded = false;

  if (eventConfig) {
    const { eventType } = node.metadata;

    if (eventType && eventType in eventConfig && eventType !== 'Root') {
      const { bundleGlyph, currentGlyph, backboneGlyph } = eventConfig[
        eventType
      ];

      if (bundleMap && Object.keys(bundleMap).includes(node.id)) {
        dropDownAdded = true;
        glyph = (
          <g fontWeight="none" style={cursorStyle}>
            {bundleGlyph}
          </g>
        );
      }

      if (current) {
        glyph = (
          <g fontWeight="none" style={cursorStyle}>
            {currentGlyph}
          </g>
        );
      } else if (!dropDownAdded) {
        glyph = (
          <g fontWeight="none" style={cursorStyle}>
            {backboneGlyph}
          </g>
        );
      }
    }
  }

  let label = '';
  let annotate = '';

  // console.log(bundleMap)
  // console.log(nodeMap[node.id]);

  if (
    bundleMap
    && Object.keys(bundleMap).includes(node.id)
    && node.actionType === 'Ephemeral'
    && expandedClusterList
    && !expandedClusterList.includes(node.id)
  ) {
    if (node.metadata && node.metadata.eventType) {
      label = `[${bundleMap[node.id].bunchedNodes.length}] ${
        node.metadata.eventType
      }`;
    } else {
      label = `[${bundleMap[node.id].bunchedNodes.length}]`;
    }
  } else {
    label = node.label;
  }

  if (
    node.artifacts
    && node.artifacts.annotations.length > 0
    && annotationOpen !== nodeMap[node.id].depth
  ) {
    annotate = node.artifacts.annotations[0].annotation;
  }

  if (!nodeMap[node.id]) {
    return null;
  }

  if (annotate.length > 20) annotate = `${annotate.substr(0, 20)}..`;

  if (label.length > 20) label = `${label.substr(0, 20)}..`;

  const labelG = (
    <g style={{ opacity: 1 }} transform={translate(padding, 0)}>
      <g transform={translate(-10, -10)}>
        <circle fill="lightgrey" opacity="1" r="7" />

        <text
          alignmentBaseline="middle"
          fill="black"
          fontSize={10}
          style={cursorStyle}
          textAnchor="middle"
          x={0}
          y={0}
        >
          {nodeCreationMap[node.id] ? nodeCreationMap[node.id].createdIn : ""}
        </text>
      </g>

      <g transform={translate(-10, 10)}>
        <circle fill="lightgrey" opacity="1" r="7" />

        <text
          alignmentBaseline="middle"
          fill="black"
          fontFamily="Icons"
          fontSize={10}
          style={cursorStyle}
          textAnchor="middle"
          x={0}
          y={0}
        >
          {nodeCreationMap[node.id] && !nodeCreationMap[node.id].approvedIn.includes(currentDataset) ? '\uf00c' : '\uf128'}
        </text>
      </g>
      {nodeCreationMap[node.id] && !nodeCreationMap[node.id].approvedIn.includes(currentDataset) ? (
        <g transform={translate(-10, 10)}>
          <foreignObject height="100" width="50" x="-45" y="-30">
            <div style={{ maxWidth: '20' }}>
              <Button
                style={{
                  margin: '1px',
                  padding: '1px',
                  maxHeight: '15px',
                  maxWidth: '15px',
                }}
                onClick={() => approvedFunction(node.id)}
              >
                <Icon color="green" name="check" size="small" style={{ margin: '0px' }} />
              </Button>
            </div>
            <div style={{ maxWidth: '20' }}>
              <Button
                style={{
                  margin: '1px',
                  padding: '1px',
                  maxHeight: '15px',
                  maxWidth: '15px',
                }}
                onClick={() => rejectedFunction(node.id)}
              >
                <Icon color="red" name="close" size="small" style={{ margin: '0px' }} />
              </Button>
            </div>
          </foreignObject>
        </g>
      ) : null}

      {!iconOnly ? (
        <g>
          {dropDownAdded ? (
            <text
              alignmentBaseline="middle"
              fill="rgb(248, 191, 132)"
              fontFamily="Icons"
              fontSize={17}
              style={cursorStyle}
              textAnchor="middle"
              x={1}
              y={0}
              onClick={(e) => nodeClicked(node, e)}
            >
              {expandedClusterList && expandedClusterList.includes(node.id) ? '\uf0d8' : '\uf0d7'}
            </text>
          ) : (
            <g />
          )}
          {editAnnotations ? (
            <button>
              <i className="fas fa-undo marginRight" />
              Undo
            </button>
          ) : (
            <g />
          )}
          <text
            dominantBaseline="middle"
            fill="black"
            fontSize={textSize}
            fontWeight="bold"
            textAnchor="start"
            x={dropDownAdded ? 10 : 0}
            y={annotate.length === 0 ? 0 : -7}
            onClick={() => labelClicked(node)}
          >
            {label}
          </text>
          ,
          <text
            dominantBaseline="middle"
            fill="black"
            fontSize={textSize}
            fontWeight="regular"
            textAnchor="start"
            x={dropDownAdded ? 10 : 0}
            y={7}
            onClick={() => labelClicked(node)}
          >
            {annotate}
          </text>
          ,
          <text
            alignmentBaseline="middle"
            className="fas fa"
            fill={prov.getBookmark(node.id) ? '#2185d0' : '#cccccc'}
            fontFamily="Icons"
            fontSize={17}
            opacity={bookmark === node.id || prov.getBookmark(node.id) ? 1 : 0}
            style={cursorStyle}
            textAnchor="middle"
            x={175}
            y={0}
            onClick={(e) => {
              prov.setBookmark(node.id, !prov.getBookmark(node.id));

              e.stopPropagation();
            }}
          >
            {'\uf02e'}
          </text>
          ,
          <text
            alignmentBaseline="middle"
            fill={annotationOpen === nodeMap[node.id].depth ? '#2185d0' : '#cccccc'}
            fontFamily="Icons"
            fontSize={17}
            opacity={bookmark === node.id || annotationOpen === nodeMap[node.id].depth ? 1 : 0}
            style={cursorStyle}
            textAnchor="middle"
            x={210}
            y={0}
            onClick={() => {
              if (annotationOpen === -1 || nodeMap[node.id].depth !== annotationOpen) {
                setAnnotationOpen(nodeMap[node.id].depth);
              } else {
                setAnnotationOpen(-1);
              }
            }}
          >
            {'\uf044'}
          </text>
        </g>
      ) : (
        <g>
          {dropDownAdded ? (
            <text
              alignmentBaseline="middle"
              fill="rgb(248, 191, 132)"
              fontFamily="Icons"
              fontSize={17}
              style={cursorStyle}
              textAnchor="middle"
              x={1}
              y={0}
              onClick={(e) => nodeClicked(node, e)}
            >
              {expandedClusterList && expandedClusterList.includes(node.id) ? '\uf0d8' : '\uf0d7'}
            </text>
          ) : (
            <g />
          )}
        </g>
      )}
    </g>
  );

  return (
    <Animate
      enter={{
        opacity: [1],
        timing: { duration: 100, delay: first ? 0 : duration },
      }}
      start={{ opacity: 0 }}
    >
      {() => (
        <>
          {popupContent !== undefined && nodeMap[node.id].depth > 0 ? (
            <Popup content={popupContent(node)} trigger={glyph} />
          ) : (
            glyph
          )}
          {/* {glyph} */}

          {popupContent !== undefined && nodeMap[node.id].depth > 0 ? (
            <Popup content={popupContent(node)} trigger={labelG} />
          ) : (
            labelG
          )}

          {annotationOpen !== -1
          && nodeMap[node.id].depth === annotationOpen ? (
              <g transform="translate(15, 25)">
                <foreignObject height="80" width="175" x="0" y="0">
                  <div>
                    <textarea
                      style={{ maxWidth: 130, resize: 'none' }}
                      value={annotateText}
                      onChange={handleInputChange}
                    />
                    <button onClick={handleCheck}>Annotate</button>

                    <button onClick={handleClose}>Close</button>
                  </div>

                  {/* <Input size='massive' icon='close' onChange={handleInputChange}
                  defaultValue={annotateText.current} placeholder="Edit Annotation" action>
                    <input />
                    <Button color="green" type="submit" onClick={handleCheck}>
                      <Icon name="world"/>
                    </Button>
                    <Button color="red" type="submit" onClick={handleClose}>
                      <Icon name="close"/>
                    </Button>
                  </Input> */}
                </foreignObject>
              </g>
            ) : (
              <g />
            )}
        </>
      )}
    </Animate>
  );

  function labelClicked(innerNode: ProvenanceNode<T, S, A>) {
    if (annotationOpen === nodeMap[innerNode.id].depth && annotationContent) {
      setAnnotationOpen(-1);
    } else if (annotationContent) {
      setAnnotationOpen(nodeMap[innerNode.id].depth);
    }
  }

  function nodeClicked(innerNode: ProvenanceNode<T, S, A>, event: any) {
    if (bundleMap && Object.keys(bundleMap).includes(innerNode.id)) {
      const exemptCopy: string[] = Array.from(exemptList);

      if (exemptCopy.includes(innerNode.id)) {
        exemptCopy.splice(
          exemptCopy.findIndex((d) => d === innerNode.id),
          1,
        );
      } else {
        exemptCopy.push(innerNode.id);
      }

      setExemptList(exemptCopy);
    }

    event.stopPropagation();
  }
}

export default BackboneNode;

// const Label: FC<{ label: string } & React.SVGProps<SVGTextElement>> = (props: {
//   label: string;
// }) => {
//   return <text {...props}>{props.label}</text>;
// };
