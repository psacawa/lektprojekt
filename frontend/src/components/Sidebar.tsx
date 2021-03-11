import {
  Divider,
  Drawer,
  Hidden,
  List,
  ListItem,
  ListItemText,
  makeStyles,
} from "@material-ui/core";
import React, { useState } from "react";
import { Link, useHistory } from "react-router-dom";

import { drawerWidth } from "../constants";
import { useAuth } from "../hooks/auth";
import { Route } from "../routes";
import { drawerRoutes, loggedInRoutes, loggedOutRoutes } from "../routes";

const DrawerItemList = (props: {
  routes: Route[];
  handleSidebarToggle: () => void;
}) => {
  const history = useHistory();
  return (
    <>
      {props.routes.map((route, idx) => (
        <ListItem
          key={idx}
          button
          onClick={(ev: React.MouseEvent<{}>) => {
            history.push(route.path);
            props.handleSidebarToggle();
          }}
        >
          <ListItemText>
            <b>{route.name}</b>
          </ListItemText>
        </ListItem>
      ))}
    </>
  );
};

const useStyles = makeStyles((theme) => ({
  list: {
    width: drawerWidth,
  },
}));

interface Props {
  sidebarOpen: boolean;
  handleSidebarToggle: () => void;
}

const Sidebar = ({ sidebarOpen, handleSidebarToggle }: Props) => {
  const classes = useStyles();
  const { user } = useAuth();
  const links = (
    <List className={classes.list}>
      <DrawerItemList
        routes={drawerRoutes}
        handleSidebarToggle={handleSidebarToggle}
      />
      <Divider />
      {!!user ? (
        <>
          <DrawerItemList
            routes={loggedInRoutes}
            handleSidebarToggle={handleSidebarToggle}
          />
          <ListItem>
            <ListItemText>Logged in as: {user.username}</ListItemText>
          </ListItem>
        </>
      ) : (
        <>
          <DrawerItemList
            routes={loggedOutRoutes}
            handleSidebarToggle={handleSidebarToggle}
          />
        </>
      )}
    </List>
  );
  return (
    <>
      <Hidden mdUp implementation="css">
        <Drawer
          variant="temporary"
          open={sidebarOpen}
          onClose={handleSidebarToggle}
        >
          {links}
        </Drawer>
      </Hidden>
      <Hidden smDown implementation="css">
        <Drawer variant="permanent">{links}</Drawer>
      </Hidden>
    </>
  );
};

export default Sidebar;
