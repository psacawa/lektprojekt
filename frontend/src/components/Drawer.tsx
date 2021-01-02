import {
  Drawer,
  List,
  ListItem,
  ListItemText,
  makeStyles,
} from "@material-ui/core";
import React from "react";
import { Link } from "react-router-dom";

import { drawerRoutes } from "../routes";

const useStyles = makeStyles(() => ({
  list: {
    width: "200px",
  },
}));
const LektDrawer = () => {
  const classes = useStyles();
  return (
    <Drawer variant="permanent">
      <List className={classes.list}>
        {drawerRoutes.map((route, idx) => (
          <ListItem key={idx} component={Link} to={route.path}>
            <ListItemText>{route.name}</ListItemText>
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};

export default LektDrawer;
