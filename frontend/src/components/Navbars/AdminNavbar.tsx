import AppBar from "@material-ui/core/AppBar";
import Hidden from "@material-ui/core/Hidden";
// @material-ui/core components
import { makeStyles } from "@material-ui/core/styles";
import Toolbar from "@material-ui/core/Toolbar";
// material-ui icons
import Menu from "@material-ui/icons/Menu";
import MoreVert from "@material-ui/icons/MoreVert";
import ViewList from "@material-ui/icons/ViewList";
import cx from "classnames";
// nodejs library to set properties for components
import React from "react";

import styles from "../../assets/jss/styles/components/adminNavbarStyle";
import { Button } from "../CustomButtons";
// core components
import AdminNavbarLinks from "./AdminNavbarLinks";

const useStyles = makeStyles(styles);

interface Props {
  color: "primary" | "info" | "success" | "warning" | "danger";
  rtlActive: boolean;
  brandText: string;
  miniActive: boolean;
  handleDrawerToggle: Function;
  sidebarMinimize: Function;
}
export default function AdminNavbar(props: Props) {
  const classes = useStyles();
  const { color, brandText } = props;
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
            {brandText}
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
