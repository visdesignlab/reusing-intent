import { createStyles, Drawer, Fab, makeStyles, Theme } from '@material-ui/core';
import AccountTreeIcon from '@material-ui/icons/AccountTree';
import { schemeSet1, symbols, SymbolType } from 'd3';
import { observer } from 'mobx-react';
import { useEffect, useMemo, useState } from 'react';

import PredictionsTable from '../components/Predictions/PredictionsTable';
import ProvenanceTree from '../components/ProvenanceTree';
import SidePanel from '../components/SidePanel';
import Visualization from '../components/Visualization';
import WorkflowMenu from '../components/WorkflowMenu';
import { AggMap, GlobalPlotAttributeContext } from '../contexts/CategoryContext';
import useWorkflowFromURL from '../hooks/useWorflow';
import { useStore } from '../stores/RootStore';

const useStyles = makeStyles((theme: Theme) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    workflowButton: {
      position: 'absolute',
      right: theme.spacing(2),
      bottom: theme.spacing(16),
      'z-index': 100000,
    },
    subroot: {
      overflow: 'hidden',
    },
    drawer: {
      overflow: 'hidden',
    },
    ...c,
  });
});

const Explore = () => {
  const styles = useStyles();
  const {
    projectStore: { dataset_id },
    exploreStore: {
      addScatterplot,
      addPCP,
      data,
      workflow,
      provenance,
      loadWorkflow,
      showCategories,
      selectedCategoryColumn,
      changeCategoryColumn,
      state: { labels },
    },
  } = useStore();

  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [aggregateOptions, setAggregateOptions] = useState<AggMap | null>(null);
  const [showWorkflowMenu, setShowWorkflowMenu] = useState(false);

  const { workflowId } = useWorkflowFromURL();

  const aggOpt = localStorage.getItem('aggOpt');

  useEffect(() => {
    if (!workflowId) return;

    if (!workflow) {
      loadWorkflow(workflowId);
    } else if (workflow.id !== workflowId) {
      loadWorkflow(workflowId);
    }
  }, [workflowId, loadWorkflow, workflow]);

  useEffect(() => {
    if (JSON.stringify(aggregateOptions) !== aggOpt) {
      if (aggOpt) {
        setAggregateOptions(JSON.parse(aggOpt));
      }
    }
  }, [aggregateOptions, aggOpt]);

  useEffect(() => {
    if (!selectedCategoryColumn && data && data.categoricalColumns.length > 0) {
      const col = localStorage.getItem('category-column');

      changeCategoryColumn(
        col && data.categoricalColumns.includes(col) ? col : data.categoricalColumns[0],
      );
    }
  }, [selectedCategoryColumn, changeCategoryColumn, data]);

  const categories = useMemo(() => {
    return selectedCategoryColumn ? data?.columnInfo[selectedCategoryColumn]?.options || [] : [];
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

  useEffect(() => {
    if (data !== null && provenance.current.label === 'Root') addScatterplot();
    // if (data !== null && provenance.current.label === 'Root') addPCP();
  }, [addScatterplot, data, provenance, addPCP]);

  if (!dataset_id) {
    if (workflowId) return <div>Loading</div>;

    return <div>Please go to projects</div>;
  }

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
          <PredictionsTable />
          <div>
            <ProvenanceTree />
          </div>
          {!showWorkflowMenu && (
            <Fab className={styles.workflowButton} onClick={() => setShowWorkflowMenu(true)}>
              <AccountTreeIcon />
            </Fab>
          )}
          <Drawer
            anchor="right"
            className={styles.drawer}
            open={showWorkflowMenu}
            onClose={() => setShowWorkflowMenu(false)}
          >
            <WorkflowMenu />
          </Drawer>
        </GlobalPlotAttributeContext.Provider>
      </div>
    </>
  );
};

export default observer(Explore);
