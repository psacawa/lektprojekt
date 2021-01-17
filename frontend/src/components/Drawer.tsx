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

import { useUser } from "../clientHooks";
import { Route } from "../routes";
import { drawerRoutes, loggedInRoutes, loggedOutRoutes } from "../routes";
import { useLoggedIn } from "../store/selectors";

const DrawerItemList = (props: { routes: Route[] }) => (
  <>
    {props.routes.map((route, idx) => (
      <ListItem key={idx} component={Link} to={route.path}>
        <ListItemText>{route.name}</ListItemText>
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
  const loggedIn = useLoggedIn();
  const userQuery = useUser({ enabled: loggedIn });
  return (
    <Drawer variant="permanent">
      <List className={classes.list}>
        <DrawerItemList routes={drawerRoutes} />
        <Divider />
        {loggedIn ? (
          <>
            <DrawerItemList routes={loggedInRoutes} />
            {userQuery.isSuccess && (
              <ListItem>
                <ListItemText>
                  Logged in as: {userQuery.data!.username}
                </ListItemText>
              </ListItem>
            )}
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
