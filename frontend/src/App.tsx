// @material-ui/core components
import { makeStyles } from "@material-ui/core/styles";
import cx from "classnames";
// creates a beautiful scrollbar
import React, { useState } from "react";
import { Redirect, Route, Switch } from "react-router-dom";

import logo from "./assets/img/logo192.png";
import styles from "./assets/jss/styles/layouts/adminStyle";
import Footer from "./components/Footer";
import LektNavbar from "./components/LektNavbar";
// core components
import { AdminNavbar } from "./components/Navbars";
import Sidebar from "./components/Sidebar";
import LektSidebar from "./components/Sidebar";
import { AppRoute, routes } from "./routes";

const useStyles = makeStyles(styles);

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
  const getActiveRoute: (routes: AppRoute[]) => any = (routes) => {
    let activeRoute = "Default Brand Text";
    for (let route of routes) {
      if ("collapse" in route) {
        let collapseActiveRoute = getActiveRoute(route.views);
        if (collapseActiveRoute !== activeRoute) {
          return collapseActiveRoute;
        }
      } else {
        // NOTE 11/03/20 psacawa: layouts unlikely to be part of the routing here
        // if (window.location.href.indexOf(route.layout + route.path) !== -1) {
        if (window.location.href.indexOf(route.path) !== -1) {
          return route.name;
        }
      }
    }
    return activeRoute;
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
        routes={routes}
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
          brandText={getActiveRoute(routes)}
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
  );
}
