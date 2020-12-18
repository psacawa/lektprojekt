import { routes } from "./routes";
import { Route, Switch } from "react-router";
import { makeStyles } from "@material-ui/core";
import React from "react";
import LektDrawer from "./components/Drawer";

const useStyles = makeStyles(() => ({
  main: {
    marginLeft: "220px",
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
