import { Button, ButtonGroup, createStyles, makeStyles } from '@material-ui/core';
import { schemeSet1, symbols, SymbolType } from 'd3';
import { observer } from 'mobx-react';
import { useEffect, useMemo, useState } from 'react';
import { Redirect } from 'react-router-dom';

import SidePanel from '../components/SidePanel';
import Visualization from '../components/Visualization';
import { AggMap, GlobalPlotAttributeContext } from '../contexts/CategoryContext';
import { useStore } from '../stores/RootStore';

const useStyles = makeStyles(() => {
  const c: any = {};

  schemeSet1.forEach((col) => {
    c[col] = { fill: col };
  });

  return createStyles({
    root: {
      display: 'grid',
      gridTemplateColumns: 'min-content 5fr 2fr 1fr',
      height: '100vh',
      width: '100vw',
      overflow: 'hidden',
    },
    subroot: {
      overflow: 'hidden',
    },
    ...c,
  });
});

const Explore = () => {
  const styles = useStyles();
  const {
    provenance,
    isAtRoot,
    isAtLatest,
    projectStore: { dataset_id },
    exploreStore: {
      addScatterplot,
      data,
      showCategories,
      selectedCategoryColumn,
      state: { views, labels },
    },
  } = useStore();
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [aggregateOptions, setAggregateOptions] = useState<AggMap | null>(null);

  const aggOpt = localStorage.getItem('aggOpt');

  useEffect(() => {
    if (JSON.stringify(aggregateOptions) !== aggOpt) {
      if (aggOpt) {
        setAggregateOptions(JSON.parse(aggOpt));
      }
    }
  }, [aggregateOptions, aggOpt]);

  const categories = useMemo(() => {
    return selectedCategoryColumn ? data?.columnInfo[selectedCategoryColumn].options || [] : [];
  }, [data, selectedCategoryColumn]);

  const labelMap = useMemo(() => {
    const m: { [key: string]: string } = {};

    Object.keys(labels).forEach((l, i) => {
      m[l] = styles[schemeSet1[i]];
    });

    return m;
  }, [labels, styles]);

  const categoryMap = useMemo(() => {
    if (categories.length > symbols.length - 1)
      throw new Error(`Cannot support more categorical values than ${symbols.length - 1}`);

    const catMap: { [key: string]: SymbolType } = {
      Unassigned: symbols[0],
    };

    categories.forEach((d, i) => {
      catMap[d] = symbols[i + 1];
    });

    return catMap;
  }, [categories]);

  const n_plots = Object.keys(views).length;

  useEffect(() => {
    if (data !== null && n_plots === 0) addScatterplot();
  }, [n_plots, addScatterplot, data]);

  if (!dataset_id) return <Redirect to="/project" />;

  return (
    <>
      <div className={styles.root}>
        <GlobalPlotAttributeContext.Provider
          value={{
            showCategory: showCategories,
            selectedCategoryColumn,
            categoryMap,
            labelMap,
            hoveredCategory,
            setHoveredCategory,
            aggregateOptions,
            setAggregateOptions,
          }}
        >
          <SidePanel />
          <div className={styles.subroot}>
            <Visualization />
          </div>
          <div>Test</div>
          <div>
            <ButtonGroup>
              <Button disabled={isAtRoot} onClick={() => provenance.undo()}>
                Undo
              </Button>
              <Button disabled={isAtLatest} onClick={() => provenance.redo()}>
                Redo
              </Button>
            </ButtonGroup>

            {Object.values(provenance.graph.nodes)
              .sort((a, b) => (a.metadata.createdOn || -1) - (b.metadata.createdOn || -1))
              .map((d) => (
                <div
                  key={d.id}
                  style={{ color: provenance.graph.current === d.id ? 'red' : 'black' }}
                >
                  {d.label}
                </div>
              ))}
          </div>
        </GlobalPlotAttributeContext.Provider>
      </div>
    </>
  );
};

export default observer(Explore);
