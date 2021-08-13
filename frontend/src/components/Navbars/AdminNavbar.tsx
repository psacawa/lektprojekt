import AppBar from "@material-ui/core/AppBar";
import Hidden from "@material-ui/core/Hidden";
import { makeStyles } from "@material-ui/core/styles";
import Toolbar from "@material-ui/core/Toolbar";
import Menu from "@material-ui/icons/Menu";
import MoreVert from "@material-ui/icons/MoreVert";
import ViewList from "@material-ui/icons/ViewList";
import styles from "assets/jss/styles/components/adminNavbarStyle";
import clsx from "clsx";
import { Button } from "components/CustomButtons";
import React from "react";
import { useLocation } from "react-router-dom";
import { AppRoute, routes } from "routes";

const useStyles = makeStyles(styles);

interface Props {
  color: "primary" | "info" | "success" | "warning" | "danger";
  miniActive: boolean;
  handleDrawerToggle: (ev: React.MouseEvent<any>) => void;
  sidebarMinimize: (ev: React.MouseEvent<any>) => void;
}
export default function AdminNavbar(props: Props) {
  const classes = useStyles();
  const { color } = props;
  const location = useLocation();

  const getActiveRoute: (routes: AppRoute[]) => string = (routes) => {
    let activeRoute = "";
    for (let route of routes) {
      if ("collapse" in route) {
        let collapseActiveRoute = getActiveRoute(route.views);
        if (collapseActiveRoute !== activeRoute) {
          return collapseActiveRoute;
        }
      } else {
        if (route.path === location.pathname) {
          return route.name;
        }
      }
    }
    return activeRoute;
  };
  const appBarClasses = clsx({
    [classes[color]]: color,
  });
  const sidebarMinimize = classes.sidebarMinimize;
  return (
    <AppBar className={classes.appBar + appBarClasses}>
      <Toolbar className={classes.container}>
        <Hidden implementation="css" smDown>
          <div className={sidebarMinimize}>
            {props.miniActive ? (
              <Button
                color="white"
                justIcon
                onClick={props.sidebarMinimize}
                round
              >
                <ViewList className={classes.sidebarMiniIcon} />
              </Button>
            ) : (
              <Button
                color="white"
                justIcon
                onClick={props.sidebarMinimize}
                round
              >
                <MoreVert className={classes.sidebarMiniIcon} />
              </Button>
            )}
          </div>
        </Hidden>
        <div className={classes.flex}>
          {/* Here we create navbar brand, based on route name */}
          <Button className={classes.title} color="transparent" href="#">
            {getActiveRoute(routes)}
          </Button>
        </div>
        <Hidden implementation="css" mdUp>
          <Button
            aria-label="open drawer"
            className={classes.appResponsive}
            color="transparent"
            justIcon
            onClick={props.handleDrawerToggle}
          >
            <Menu />
          </Button>
        </Hidden>
      </Toolbar>
    </AppBar>
  );
}
