<<<<<<< HEAD
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
=======
import { makeStyles } from "@material-ui/core/styles";
import cx from "classnames";
import React from "react";
import { Redirect, Route, Switch } from "react-router-dom";

import logo from "./assets/img/logo192.png";
import styles from "./assets/jss/styles/layouts/adminStyle";
import Footer from "./components/Footer";
import { AdminNavbar } from "./components/Navbars";
import Sidebar from "./components/Sidebar";
import { AppRoute, routes } from "./routes";

const useStyles = makeStyles(styles);
>>>>>>> 92345be3148316aa7ba7312e68bfc15474d69021

export default function App(
  this: React.FunctionComponent<any>,
  props: any
): JSX.Element {
  const { ...rest } = props;
  // states and functions
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [miniActive, setMiniActive] = React.useState(false);
  const [image, setImage] = React.useState(require("assets/img/sidebar-2.jpg"));
  // const [bgColor, setBgColor] = React.useState("black");
  let bgColor = "black";
  let color = "blue";
  // const [logo, setLogo] = React.useState(require("assets/img/logo-white.svg"));
  // styles
  const classes = useStyles();
<<<<<<< HEAD
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
=======
  const mainPanelClasses =
    classes.mainPanel +
    " " +
    cx({
      [classes.mainPanelSidebarMini]: miniActive,
    });
  // ref for main panel div
  const mainPanel = React.createRef<any>();
  // effect instead of componentDidMount, componentDidUpdate and componentWillUnmount
  React.useEffect(() => {
    window.addEventListener("resize", resizeFunction);

    // Specify how to clean up after this effect:
    return function cleanup() {
      window.removeEventListener("resize", resizeFunction);
    };
  });
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };
  const getRoutes: (routes: AppRoute[]) => any = (routes: AppRoute[]) => {
    return routes.map((route, key) => {
      if ("collapse" in route) {
        return getRoutes(route.views);
      }
      // NOTE 11/03/20 psacawa: here is the attach point for alternate layouts
      return (
        <Route
          key={key}
          exact={route.exact}
          path={route.path}
          component={route.component}
        />
      );
    });
  };
  const sidebarMinimize = () => {
    setMiniActive(!miniActive);
  };
  const resizeFunction = () => {
    if (window.innerWidth >= 960) {
      setMobileOpen(false);
    }
  };

  return (
    <div className={classes.wrapper}>
      <Sidebar
        logoText={process.env.REACT_APP_NAME}
        logo={logo}
        image={image}
        handleDrawerToggle={handleDrawerToggle}
        open={mobileOpen}
        color={color}
        bgColor={bgColor}
        miniActive={miniActive}
        {...rest}
      />
      <div className={mainPanelClasses} ref={mainPanel}>
        <AdminNavbar
          sidebarMinimize={sidebarMinimize.bind(this)}
          miniActive={miniActive}
          handleDrawerToggle={handleDrawerToggle}
          {...rest}
        />
        <div className={classes.content}>
          <div className={classes.container}>
            <Switch>
              {getRoutes(routes)}
              <Redirect from="/admin" to="/admin/dashboard" />
            </Switch>
          </div>
        </div>
        <Footer fluid />
      </div>
    </div>
>>>>>>> 92345be3148316aa7ba7312e68bfc15474d69021
  );
}
