import { makeStyles } from "@material-ui/core";
import axios from "axios";
import React, { useState } from "react";
import { Route, Switch } from "react-router";

import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import { drawerWidth } from "./constants";
import { useCsrfToken } from "./hooks";
import { routes } from "./routes";

const useStyles = makeStyles((theme) => ({
  mainPanel: {
    [theme.breakpoints.up("md")]: {
      width: `calc(100% - ${drawerWidth}px)`,
      marginLeft: drawerWidth,
    },
  },
}));

function App() {
  const classes = useStyles();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };
  return (
    <>
      <Sidebar {...{ sidebarOpen, handleSidebarToggle }} />
      <Navbar {...{ handleSidebarToggle }} />
      <main className={classes.mainPanel}>
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
    </>
  );
}

export default App;
