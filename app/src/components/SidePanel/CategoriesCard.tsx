import {
  Button,
  Card,
  CardContent,
  CardHeader,
  createStyles,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  makeStyles,
  Switch,
  TextField,
  Theme,
  Typography,
} from '@material-ui/core';
import { Autocomplete, createFilterOptions } from '@material-ui/lab';
import { symbol, symbols } from 'd3';
import { observer } from 'mobx-react';
import { FormEvent, useContext, useMemo, useState } from 'react';

import { CategoryContext } from '../../contexts/CategoryContext';
import { useStore } from '../../stores/RootStore';

import Symbol from './Symbol';

type CategoryOption = {
  inputValue?: string;
  title: string;
};

type NewCategory = {
  name: string;
  options: string;
};

const filter = createFilterOptions<CategoryOption>();

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: { minWidth: 250 },
    fc: { margin: theme.spacing(1), minWidth: 200 },
    form: {
      '& .MuiTextField-root': {
        margin: theme.spacing(1),
        width: '25ch',
      },
    },
  }),
);

const CategoriesCard = () => {
  const styles = useStyles();
  const {
    exploreStore: { toggleShowCategories, doesHaveCategories, data, changeCategoryColumn },
    projectStore: { addCategoryColumn },
  } = useStore();

  const {
    showCategory = false,
    selectedCategoryColumn = null,
    categoryMap = {},
    setHoveredCategory,
  } = useContext(CategoryContext) || {};

  const categoryOptions: CategoryOption[] = useMemo(() => {
    if (!data) return [];

    return data.categoricalColumns.map((c) => ({
      title: c,
    }));
  }, [data]);

  const [openDialog, setOpenDialog] = useState(false);
  const [dialogValue, setDialogValue] = useState<NewCategory>({ name: '', options: '' });

  const handleDialogClose = () => {
    setDialogValue({ name: '', options: '' });
    setOpenDialog(false);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    addCategoryColumn(dialogValue.name, dialogValue.options);
    setOpenDialog(false);
  };

  if (!data) return <div>Loading</div>;

  return (
    <>
      <Card className={styles.root}>
        <CardHeader
          action={
            <Switch
              checked={showCategory}
              disabled={!doesHaveCategories}
              size="small"
              onChange={toggleShowCategories}
            />
          }
          subheader="Enable category encoding"
          title="Categories"
        />
        {!doesHaveCategories ? (
          <CardContent>No category column in the dataset!</CardContent>
        ) : selectedCategoryColumn === null ? (
          <CardContent>Loading...</CardContent>
        ) : (
          <CardContent>
            <Autocomplete
              disabled={!showCategory}
              filterOptions={(options, params) => {
                const filtered = filter(options, params);

                if (params.inputValue !== '') {
                  filtered.push({
                    inputValue: params.inputValue,
                    title: `Add "${params.inputValue}"`,
                  });
                }

                return filtered;
              }}
              getOptionLabel={(option) => {
                if (typeof option === 'string') return option;

                if (option.inputValue) return option.inputValue;

                return option.title;
              }}
              getOptionSelected={(option, value) => option.title === value.title}
              options={categoryOptions}
              renderInput={(params) => (
                <TextField {...params} label="Showing categories" variant="outlined" />
              )}
              renderOption={(opt) => (
                <Typography variant="button">{opt.title.toUpperCase()}</Typography>
              )}
              value={{ title: selectedCategoryColumn }}
              clearOnBlur
              handleHomeEndKeys
              selectOnFocus
              onChange={(event, newValue) => {
                if (typeof newValue === 'string') {
                  setTimeout(() => {
                    setOpenDialog(true);
                    setDialogValue({ name: newValue, options: '' });
                  });
                } else if (newValue && newValue.inputValue) {
                  setOpenDialog(true);
                  setDialogValue({ name: newValue.inputValue, options: '' });
                } else {
                  changeCategoryColumn(newValue?.title || null);
                }
              }}
            />
            {Object.entries(categoryMap).map(([col, sym]) => (
              <Symbol
                key={col}
                disabled={!showCategory}
                label={col}
                path={symbol(sym).size(100)()}
                onHover={setHoveredCategory}
              />
            ))}
          </CardContent>
        )}
      </Card>
      <Dialog open={openDialog} onClose={handleDialogClose}>
        <form className={styles.form} onSubmit={handleSubmit}>
          <DialogTitle>Add a new categorical dimension.</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Specify the options you want, seperated by commas (,)
            </DialogContentText>
            <TextField
              id="category-name"
              label="Category Name"
              type="text"
              value={dialogValue.name}
              autoFocus
              onChange={(event) => setDialogValue({ ...dialogValue, name: event.target.value })}
            />
            <FormControl fullWidth>
              <TextField
                helperText={`Max ${symbols.length - 1} options supported.`}
                id="category-options"
                label="Options"
                type="text"
                value={dialogValue.options}
                autoFocus
                fullWidth
                multiline
                onChange={(event) =>
                  setDialogValue({
                    ...dialogValue,
                    options: event.target.value,
                  })
                }
              />
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDialogClose}>Cancel</Button>
            <Button
              disabled={
                dialogValue.options.length === 0 ||
                dialogValue.options.split(',').length >= symbols.length
              }
              type="submit"
            >
              Add
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
};

export default observer(CategoriesCard);
