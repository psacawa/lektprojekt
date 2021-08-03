import AppBar from "@material-ui/core/AppBar";
import Hidden from "@material-ui/core/Hidden";
import { makeStyles } from "@material-ui/core/styles";
import Toolbar from "@material-ui/core/Toolbar";
import Menu from "@material-ui/icons/Menu";
import MoreVert from "@material-ui/icons/MoreVert";
import ViewList from "@material-ui/icons/ViewList";
import styles from "assets/jss/styles/components/adminNavbarStyle";
import cx from "classnames";
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
  const appBarClasses = cx({
    [" " + classes[color]]: color,
  });
  const sidebarMinimize = classes.sidebarMinimize;
  return (
    <AppBar className={classes.appBar + appBarClasses}>
      <Toolbar className={classes.container}>
        <Hidden smDown implementation="css">
          <div className={sidebarMinimize}>
            {props.miniActive ? (
              <Button
                justIcon
                round
                color="white"
                onClick={props.sidebarMinimize}
              >
                <ViewList className={classes.sidebarMiniIcon} />
              </Button>
            ) : (
              <Button
                justIcon
                round
                color="white"
                onClick={props.sidebarMinimize}
              >
                <MoreVert className={classes.sidebarMiniIcon} />
              </Button>
            )}
          </div>
        </Hidden>
        <div className={classes.flex}>
          {/* Here we create navbar brand, based on route name */}
          <Button href="#" className={classes.title} color="transparent">
            {getActiveRoute(routes)}
          </Button>
        </div>
        <Hidden mdUp implementation="css">
          <Button
            className={classes.appResponsive}
            color="transparent"
            justIcon
            aria-label="open drawer"
            onClick={props.handleDrawerToggle}
          >
            <Menu />
          </Button>
        </Hidden>
      </Toolbar>
    </AppBar>
  );
}
