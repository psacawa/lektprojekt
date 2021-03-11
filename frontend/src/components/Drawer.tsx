import {
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemText,
  makeStyles,
} from "@material-ui/core";
import React from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../hooks/auth";
import { Route } from "../routes";
import { drawerRoutes, loggedInRoutes, loggedOutRoutes } from "../routes";

const DrawerItemList = (props: { routes: Route[] }) => (
  <>
    {props.routes.map((route, idx) => (
      <ListItem key={idx} component={Link} to={route.path}>
        <ListItemText>
          <b>{route.name}</b>
        </ListItemText>
      </ListItem>
    ))}
  </>
);

const useStyles = makeStyles(() => ({
  list: {
    width: "200px",
  },
}));
const LektDrawer = () => {
  const classes = useStyles();
  const { user } = useAuth();
  return (
    <Drawer variant="permanent">
      <List className={classes.list}>
        <DrawerItemList routes={drawerRoutes} />
        <Divider />
        {!!user ? (
          <>
            <DrawerItemList routes={loggedInRoutes} />
            <ListItem>
              <ListItemText>Logged in as: {user.username}</ListItemText>
            </ListItem>
          </>
        ) : (
          <>
            <DrawerItemList routes={loggedOutRoutes} />
          </>
        )}
      </List>
    </Drawer>
  );
};

export default LektDrawer;
