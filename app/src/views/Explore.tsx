import { makeStyles } from '@material-ui/core';
import { symbols, SymbolType } from 'd3';
import { observer } from 'mobx-react';
import { useEffect, useMemo } from 'react';
import { Redirect } from 'react-router-dom';

import Visualization from '../components/Visualization';
import { CategoryContext } from '../contexts/CategoryContext';
import { useStore } from '../stores/RootStore';

const useStyles = makeStyles(() => ({
  root: {
    display: 'grid',
    gridTemplateColumns: '5fr 2fr 1fr',
    height: '100vh',
    width: '100vw',
    overflow: 'hidden',
  },
}));

const Explore = () => {
  const styles = useStyles();
  const {
    projectStore: { dataset_id },
    exploreStore: {
      addScatterplot,
      data,
      showCategories,
      selectedCategoryColumn,
      state: { views },
    },
  } = useStore();

  const categories = useMemo(() => {
    return selectedCategoryColumn ? data?.columnInfo[selectedCategoryColumn].options || [] : [];
  }, [data, selectedCategoryColumn]);

  const categoryMap = useMemo(() => {
    if (categories.length > symbols.length)
      throw new Error(`Cannot support more categorical values than ${symbols.length}`);

    const catMap: { [key: string]: SymbolType } = {};

    categories.forEach((d, i) => {
      catMap[d] = symbols[i];
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
        <CategoryContext.Provider
          value={{
            showCategory: showCategories,
            selectedCategoryColumn,
            categoryMap,
          }}
        >
          <Visualization />
        </CategoryContext.Provider>
      </div>
    </>
  );
};

export default observer(Explore);
