import { makeStyles } from "@material-ui/core";
import axios from "axios";
import React from "react";
import { Route, Switch } from "react-router";

import LektDrawer from "./components/Drawer";
import { useCsrfToken } from "./hooks";
import { routes } from "./routes";

const useStyles = makeStyles(() => ({
  main: {
    marginLeft: 220,
    marginRight: 20,
    maxWidth: 800,
  },
}));

function App() {
  const classes = useStyles();
  return (
    <div>
      <LektDrawer />
      <main className={classes.main}>
        <Switch>
          {routes.map((route, idx) => (
            <Route
              key={idx}
              path={route.path}
              exact={route.exact}
              component={route.component}
            ></Route>
          ))}
        </Switch>
      </main>
    </div>
  );
}

export default App;
