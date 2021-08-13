import AppBar from "@material-ui/core/AppBar";
import Drawer from "@material-ui/core/Drawer";
import Hidden from "@material-ui/core/Hidden";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
// @material-ui/core components
import { makeStyles } from "@material-ui/core/styles";
import Toolbar from "@material-ui/core/Toolbar";
// @material-ui/icons
import Dashboard from "@material-ui/icons/Dashboard";
import Fingerprint from "@material-ui/icons/Fingerprint";
import LockOpen from "@material-ui/icons/LockOpen";
import Menu from "@material-ui/icons/Menu";
import MonetizationOn from "@material-ui/icons/MonetizationOn";
import PersonAdd from "@material-ui/icons/PersonAdd";
import styles from "assets/jss/styles/components/authNavbarStyle";
import clsx from "clsx";
// core components
import { Button } from "components/CustomButtons";
import React from "react";
import { NavLink } from "react-router-dom";

const useStyles = makeStyles(styles);

interface Props {
  color: "primary" | "info" | "success" | "warning" | "danger";
  brandText: string;
}

export default function AuthNavbar(props: Props) {
  const [open, setOpen] = React.useState(false);
  const handleDrawerToggle = () => {
    setOpen(!open);
  };
  // verifies if routeName is the one active (in browser input)
  const activeRoute = (routeName: string) => {
    return window.location.href.indexOf(routeName) > -1 ? true : false;
  };
  const classes = useStyles();
  const { color, brandText } = props;
  const appBarClasses = clsx({
    [classes[color]]: color,
  });
  let list = (
    <List className={classes.list}>
      <ListItem className={classes.listItem}>
        <NavLink className={classes.navLink} to={"/admin/dashboard"}>
          <Dashboard className={classes.listItemIcon} />
          <ListItemText
            className={classes.listItemText}
            disableTypography={true}
            primary={"Dashboard"}
          />
        </NavLink>
      </ListItem>
      <ListItem className={classes.listItem}>
        <NavLink
          className={clsx(classes.navLink, {
            [classes.navLinkActive]: activeRoute("/auth/pricing-page"),
          })}
          to={"/auth/pricing-page"}
        >
          <MonetizationOn className={classes.listItemIcon} />
          <ListItemText
            className={classes.listItemText}
            disableTypography={true}
            primary={"Pricing"}
          />
        </NavLink>
      </ListItem>
      <ListItem className={classes.listItem}>
        <NavLink
          className={clsx(classes.navLink, {
            [classes.navLinkActive]: activeRoute("/auth/register-page"),
          })}
          to={"/auth/register-page"}
        >
          <PersonAdd className={classes.listItemIcon} />
          <ListItemText
            className={classes.listItemText}
            disableTypography={true}
            primary={"Register"}
          />
        </NavLink>
      </ListItem>
      <ListItem className={classes.listItem}>
        <NavLink
          className={clsx(classes.navLink, {
            [classes.navLinkActive]: activeRoute("/auth/login-page"),
          })}
          to={"/auth/login-page"}
        >
          <Fingerprint className={classes.listItemIcon} />
          <ListItemText
            className={classes.listItemText}
            disableTypography={true}
            primary={"Login"}
          />
        </NavLink>
      </ListItem>
      <ListItem className={classes.listItem}>
        <NavLink
          className={clsx(classes.navLink, {
            [classes.navLinkActive]: activeRoute("/auth/lock-screen-page"),
          })}
          to={"/auth/lock-screen-page"}
        >
          <LockOpen className={classes.listItemIcon} />
          <ListItemText
            className={classes.listItemText}
            disableTypography={true}
            primary={"Lock"}
          />
        </NavLink>
      </ListItem>
    </List>
  );
  return (
    <AppBar className={classes.appBar + appBarClasses} position="static">
      <Toolbar className={classes.container}>
        <Hidden smDown>
          <div className={classes.flex}>
            <Button className={classes.title} color="transparent" href="#">
              {brandText}
            </Button>
          </div>
        </Hidden>
        <Hidden mdUp>
          <div className={classes.flex}>
            <Button className={classes.title} color="transparent" href="#">
              MD Pro React
            </Button>
          </div>
        </Hidden>
        <Hidden smDown>{list}</Hidden>
        <Hidden mdUp>
          <Button
            aria-label="open drawer"
            className={classes.sidebarButton}
            color="transparent"
            justIcon
            onClick={handleDrawerToggle}
          >
            <Menu />
          </Button>
        </Hidden>
        <Hidden mdUp>
          <Hidden mdUp>
            <Drawer
              ModalProps={{
                keepMounted: true, // Better open performance on mobile.
              }}
              anchor={"right"}
              classes={{
                paper: classes.drawerPaper,
              }}
              onClose={handleDrawerToggle}
              open={open}
              variant="temporary"
            >
              {list}
            </Drawer>
          </Hidden>
        </Hidden>
      </Toolbar>
    </AppBar>
  );
}
