/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */
import {
  AppBar,
  Button,
  Divider,
  FormControl,
  makeStyles,
  Theme,
  Toolbar,
  Dialog,
  DialogContent,
  TextField,
  DialogActions,
  Menu,
  MenuItem,

} from '@material-ui/core';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import RadioButtonUncheckedIcon from '@material-ui/icons/RadioButtonUnchecked';
import { ToggleButton, ToggleButtonGroup } from '@material-ui/lab';
import { observer } from 'mobx-react';
import React, { FC, useContext, useState, ReactElement } from 'react';
import NestedMenuItem from 'material-ui-nested-menu-item';


import Store from '../Store/Store';

import AddPlot from './AddPlotComponent/AddPlot';

const useStyles = makeStyles((theme: Theme) => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  formControlwoWidth: {
    margin: theme.spacing(1),
  },
}));

const Navbar: FC = () => {
  const classes = useStyles();
  const [open, setOpen] = useState(false);
  const [openCategoryCreate, setOpenCategoryCreate] = useState(false);
  const [menuDrop, setMenuDrop] = useState<HTMLButtonElement | null>(null);

  const [labelName, setLabelName] = useState("");
  const [categoryCreationName, setCategoryCreationName] = useState('');


  const menuButton = (
    <Button
      color="primary"
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      variant="outlined"
      onClick={(event) => {
        setMenuDrop(event.currentTarget);
      }}
    >
      Menu
    </Button>
  );

  const {
    exploreStore: { brushType, switchBrush, filter, aggregate, label, createCategory, addToCategory, categories },
  } = useContext(Store);

  console.log(categories);


  return (
    <div>
      <AppBar color="transparent" position="static">
        <Toolbar>
          <AddPlot />
          <Divider orientation="vertical" flexItem />
          {/* <FormControl className={classes.formControl}>
            <ToggleButtonGroup
              value={brushType}
              exclusive
              onChange={(_, bt) => {
                switchBrush(bt);
              }}
            >
              <ToggleButton value="Rectangular">
                <CheckBoxOutlineBlankIcon />
              </ToggleButton>
              <ToggleButton value="Freeform Small">
                <RadioButtonUncheckedIcon fontSize="small" />
              </ToggleButton>
              <ToggleButton value="Freeform Medium">
                <RadioButtonUncheckedIcon />
              </ToggleButton>
              <ToggleButton value="Freeform Large">
                <RadioButtonUncheckedIcon fontSize="large" />
              </ToggleButton>
            </ToggleButtonGroup>
          </FormControl> */}

          {/* <Button
            color="primary"
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            variant="outlined"
            onClick={() => {
              // loadComparisonFilter("demo")
              filter('In');
            }}
          >
            Filter In
          </Button>
          <Button
            color="primary"
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            variant="outlined"
            onClick={() => {
              aggregate();
            }}
          >
            Aggregate
          </Button>

          <Button
            color="primary"
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            variant="outlined"
            onClick={() => {
              // loadComparisonFilter("demo")
              setOpen(true);
            }}
          >
            Label Nodes
          </Button> */}

          {/* <Button
            color="primary"
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            variant="outlined"
            onClick={() => {
              // loadComparisonFilter("demo")
              storeProvenance(provenance.graph, workflows, provDb, currentProject?.key || 'Empty');
            }}
          >
            Store prov
          </Button> */}

          {/* <Button
            color="primary"
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            variant="outlined"
            onClick={() => {
              setOpen(true);
            }}
          >
            Bundle
          </Button> */}
          <Divider />

          {menuButton}
          <Menu
            anchorEl={menuDrop}
            id="simple-menu"
            open={Boolean(menuDrop)}
            keepMounted
            onClose={() => setMenuDrop(null)}
          >
            <MenuItem onClick={() => setOpen(true)}>Set Label</MenuItem>

            <NestedMenuItem
              label="Change Brush"
              parentMenuOpen={menuDrop}
              onClick={() => console.log('Hello')}
            >
              <MenuItem onClick={() => switchBrush('Rectangular')}>
                Rectangular Brush (add little image)
              </MenuItem>
              <MenuItem onClick={() => switchBrush('Freeform Small')}>
                Freeform Small Brush (add little image)
              </MenuItem>
              <MenuItem onClick={() => switchBrush('Freeform Medium')}>
                Freeform Medium Brush (add little image)
              </MenuItem>
              <MenuItem onClick={() => switchBrush('Freeform Large')}>
                Freeform Large Brush (add little image)
              </MenuItem>
            </NestedMenuItem>
            <NestedMenuItem
              label="Filter Selection"
              parentMenuOpen={menuDrop}
              onClick={() => console.log('Hello')}
            >
              <MenuItem onClick={() => filter('In')}>In</MenuItem>
              <MenuItem onClick={() => filter('Out')}>Out</MenuItem>
            </NestedMenuItem>

            <NestedMenuItem
              label="Aggregate Selection"
              parentMenuOpen={menuDrop}
              onClick={() => console.log('Hello')}
            >
              <MenuItem onClick={() => aggregate()}>Aggregate by Mean</MenuItem>
            </NestedMenuItem>
            <MenuItem onClick={() => setOpenCategoryCreate(true)}>Create Category</MenuItem>
            <NestedMenuItem
              label="Assign Selection to Category"
              parentMenuOpen={menuDrop}
              onClick={() => console.log('Hello')}
            >
              {Object.keys(categories).map((a: string) => {
                console.log(a)

                return (<MenuItem key={a} onClick={() => addToCategory(a)}>{a}</MenuItem>);
              })}
            </NestedMenuItem>
          </Menu>

          <Dialog aria-labelledby="form-dialog-title" open={open} onClose={() => setOpen(false)}>
            <DialogContent>
              <TextField
                autoComplete="off"
                id="name"
                label="Label Name"
                margin="dense"
                type="email"
                autoFocus
                fullWidth
                onChange={(e) => setLabelName(e.target.value)}
              />
            </DialogContent>
            <DialogActions>
              <Button color="primary" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                color="primary"
                onClick={() => {
                  label(labelName);
                  setOpen(false);
                }}
              >
                Add Label to Nodes
              </Button>
            </DialogActions>
          </Dialog>

          <Dialog aria-labelledby="form-dialog-title" open={openCategoryCreate} onClose={() => setOpenCategoryCreate(false)}>
            <DialogContent>
              <TextField
                autoComplete="off"
                id="name"
                label="Category Name"
                margin="dense"
                type="email"
                autoFocus
                fullWidth
                onChange={(e) => setCategoryCreationName(e.target.value)}
              />
            </DialogContent>
            <DialogActions>
              <Button color="primary" onClick={() => setOpenCategoryCreate(false)}>
                Cancel
              </Button>
              <Button
                color="primary"
                onClick={() => {
                  createCategory(categoryCreationName);
                  setOpenCategoryCreate(false);
                }}
              >
                Create Category
              </Button>
            </DialogActions>
          </Dialog>
        </Toolbar>
      </AppBar>
    </div>
  );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(Navbar as any).whyDidYouRender = {
  logOnDifferentValues: true,
};
export default observer(Navbar);
