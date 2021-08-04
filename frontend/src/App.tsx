import { makeStyles } from "@material-ui/core/styles";
import { ErrorBoundary } from "@sentry/react";
import logo from "assets/img/logo192.png";
import styles from "assets/jss/styles/layouts/adminStyle";
import cx from "classnames";
import Footer from "components/Footer";
import { AdminNavbar } from "components/Navbars";
import Sidebar from "components/Sidebar";
import React from "react";
import { Redirect, Route, Switch } from "react-router-dom";
import { AppRoute, routes } from "routes";

const useStyles = makeStyles(styles);

export default function App(
  this: React.FunctionComponent<any>,
  props: any
): JSX.Element {
  const { ...rest } = props;
  // states and functions
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [miniActive, setMiniActive] = React.useState(false);
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
        logoText={process.env.REACT_NAME}
        logo={logo}
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
              <ErrorBoundary
                showDialog
                beforeCapture={(scope) => {
                  scope.setTag("location", window.location.href);
                }}
                fallback={<p>An error occured and has been reported.</p>}
              >
                {getRoutes(routes)}
              </ErrorBoundary>
              <Redirect from="/admin" to="/admin/dashboard" />
            </Switch>
          </div>
        </div>
        <Footer fluid />
      </div>
    </div>
  );
}
