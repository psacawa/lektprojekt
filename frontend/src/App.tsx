import { makeStyles } from "@material-ui/core/styles";
import { ErrorBoundary } from "@sentry/react";
import logo from "assets/img/logo192.png";
import styles from "assets/jss/styles/layouts/adminStyle";
import clsx from "clsx";
import AuthRedirect from "components/AuthRedirect";
import Footer from "components/Footer";
import { AdminNavbar } from "components/Navbars";
import Sidebar from "components/Sidebar";
import { useAuth } from "hooks";
import React from "react";
import { Redirect, Route, Switch } from "react-router-dom";
import { AppRoute, routes } from "routes";

const useStyles = makeStyles(styles);

export default function App(
  this: React.FunctionComponent<any>,
  props: any
): JSX.Element {
  const { ...rest } = props;
  const { user } = useAuth();
  // states and functions
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [miniActive, setMiniActive] = React.useState(false);
  // const [bgColor, setBgColor] = React.useState("black");
  let bgColor = "black";
  let color = "blue";
  // styles
  const classes = useStyles();
  const mainPanelClasses = clsx(classes.mainPanel, {
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
  // routing
  const getRoutes: (routes: AppRoute[]) => any = (routes: AppRoute[]) => {
    return routes.map((route, key) => {
      if ("collapse" in route) {
        return getRoutes(route.views);
      }
      // NOTE 11/03/20 psacawa: here is the attach point for alternate layouts
      return (
        <React.Fragment key={key}>
          {route.login === "required" ? (
            <AuthRedirect key={key}>
              <Route
                component={route.component}
                exact={route.exact}
                key={key}
                path={route.path}
              />
            </AuthRedirect>
          ) : (
            <Route
              component={route.component}
              exact={route.exact}
              key={key}
              path={route.path}
            />
          )}
        </React.Fragment>
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
        bgColor={bgColor}
        color={color}
        handleDrawerToggle={handleDrawerToggle}
        logo={logo}
        logoText={process.env.REACT_NAME}
        miniActive={miniActive}
        open={mobileOpen}
        {...rest}
      />
      <div className={mainPanelClasses} ref={mainPanel}>
        <AdminNavbar
          handleDrawerToggle={handleDrawerToggle}
          miniActive={miniActive}
          sidebarMinimize={sidebarMinimize.bind(this)}
          {...rest}
        />
        <div className={classes.content}>
          <div className={classes.container}>
            {/* routing */}
            <Switch>
              <ErrorBoundary
                beforeCapture={(scope) => {
                  scope.setTag("location", window.location.href);
                }}
                dialogOptions={{
                  user: user ? { name: user.username, email: user.email } : {},
                }}
                fallback={<p>An error occured and has been reported.</p>}
                showDialog
              >
                {getRoutes(routes)}
              </ErrorBoundary>
            </Switch>
          </div>
        </div>
        <Footer fluid />
      </div>
    </div>
  );
}
