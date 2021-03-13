import { Avatar, makeStyles } from "@material-ui/core";
import Collapse from "@material-ui/core/Collapse";
import Drawer from "@material-ui/core/Drawer";
import Hidden from "@material-ui/core/Hidden";
import Icon from "@material-ui/core/Icon";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import { Person } from "@material-ui/icons";
import cx from "classnames";
import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";

import sidebarStyle from "../../assets/jss/styles/components/sidebarStyle";
import { AdminNavbarLinks } from "../../components/Navbars";
import { useAuth } from "../../hooks/auth";
import {
  AppRoute,
  baseDrawerRoutes,
  loggedInRoutes,
  loggedOutRoutes,
} from "../../routes";

interface SidebarWrapperProps {
  className: string;
  userDisplay: JSX.Element | null;
  headerLinks?: object;
  links: object;
}

class SidebarWrapper extends React.Component<SidebarWrapperProps> {
  sidebarWrapper = React.createRef<HTMLDivElement>();
  render() {
    const { className, userDisplay, headerLinks, links } = this.props;
    return (
      <div className={className} ref={this.sidebarWrapper}>
        {userDisplay}
        {headerLinks}
        {links}
      </div>
    );
  }
}

const useStyles = makeStyles(sidebarStyle);

interface SidebarProps {
  bgColor: "white" | "black" | "blue";
  color: "white" | "red" | "orange" | "green" | "blue" | "purple" | "rose";
  logo: string;
  logoText: string;
  image: string;
  miniActive: boolean;
  open: boolean;
  handleDrawerToggle: (ev: React.MouseEvent<any>) => void;
}

function Sidebar(props: SidebarProps) {
  const { logo, image, logoText, bgColor } = props;
  const classes = useStyles();
  const location = useLocation();
  const { user } = useAuth();
  const drawerRoutesToDisplay = [
    ...baseDrawerRoutes,
    ...(!!user ? loggedInRoutes : loggedOutRoutes),
  ];
  // this creates the intial state of this component based on the collapse routes
  // that it gets through props.routes
  function getCollapseStates(routes: AppRoute[]): Record<string, boolean> {
    let initialState = {};
    routes.map((prop) => {
      if ("collapse" in prop) {
        initialState = {
          [prop.state]: getCollapseInitialState(prop.views),
          ...getCollapseStates(prop.views),
          ...initialState,
        };
      }
      return null;
    });
    return initialState;
  }

  // this verifies if any of the collapses should be default opened on a rerender of this component
  // for example, on the refresh of the page,
  // while on the src/views/forms/RegularFormsx - route /admin/regular-forms
  function getCollapseInitialState(routes: AppRoute[]) {
    for (let route of routes) {
      if ("collapse" in route && getCollapseInitialState(route.views)) {
        return true;
      } else if (window.location.href.indexOf(route.path) !== -1) {
        return true;
      }
    }
    return false;
  }

  const [openAvatar, setOpenAvatar] = useState(false);
  const [miniActive, setMiniActive] = useState(true);
  const [routeCollapse, setRouteCollapse] = useState(
    getCollapseStates(drawerRoutesToDisplay)
  );
  const mainPanel = React.useRef<any>();

  // verifies if routeName is the one active (in browser input)
  const activeRoute = (routeName: string) => {
    return window.location.href.indexOf(routeName) > -1 ? "active" : "";
  };
  // this function creates the links and collapses that appear in the sidebar (left menu)
  const createLinks = (routes: AppRoute[]) => {
    const { color } = props;
    return routes.map((route, key) => {
      if ("redirect" in route) {
        return null;
      }
      if ("collapse" in route) {
        let newCollapseState: Record<string, boolean> = {};
        newCollapseState[route["state"]] = routeCollapse[route.state];
        const navLinkClasses =
          classes.itemLink +
          " " +
          cx({
            [" " + classes.collapseActive]: getCollapseInitialState(
              route.views
            ),
          });
        const itemText =
          classes.itemText +
          " " +
          cx({
            [classes.itemTextMini]: props.miniActive && miniActive,
          });
        const collapseItemText =
          classes.collapseItemText +
          " " +
          cx({
            [classes.collapseItemTextMini]: props.miniActive && miniActive,
          });
        const itemIcon = classes.itemIcon;
        const caret = classes.caret;
        const collapseItemMini = classes.collapseItemMini;
        return (
          <ListItem
            key={key}
            className={cx(
              { [classes.item]: route.icon !== undefined },
              { [classes.collapseItem]: route.icon === undefined }
            )}
          >
            <NavLink
              to={"#"}
              className={navLinkClasses}
              onClick={(e) => {
                e.preventDefault();
                setRouteCollapse(newCollapseState);
              }}
            >
              {route.icon !== undefined ? (
                typeof route.icon === "string" ? (
                  <Icon className={itemIcon}>{route.icon}</Icon>
                ) : (
                  <route.icon className={itemIcon} />
                )
              ) : (
                <span className={collapseItemMini}>{route.mini}</span>
              )}
              <ListItemText
                primary={route.name}
                secondary={
                  <b
                    className={
                      caret +
                      " " +
                      (routeCollapse[route.state] ? classes.caretActive : "")
                    }
                  />
                }
                disableTypography={true}
                className={cx(
                  { [itemText]: route.icon !== undefined },
                  { [collapseItemText]: route.icon === undefined }
                )}
              />
            </NavLink>
            <Collapse in={routeCollapse[route.state]} unmountOnExit>
              <List className={classes.list + " " + classes.collapseList}>
                {createLinks(route.views)}
              </List>
            </Collapse>
          </ListItem>
        );
      }
      const innerNavLinkClasses =
        classes.collapseItemLink +
        " " +
        cx({
          [" " + classes[color]]: location.pathname === route.path,
        });
      const collapseItemMini = classes.collapseItemMini;
      const navLinkClasses =
        classes.itemLink +
        " " +
        cx({
          [" " + classes[color]]: location.pathname === route.path,
        });
      const itemText =
        classes.itemText +
        " " +
        cx({
          [classes.itemTextMini]: props.miniActive && miniActive,
        });
      const collapseItemText =
        classes.collapseItemText +
        " " +
        cx({
          [classes.collapseItemTextMini]: props.miniActive && miniActive,
        });
      const itemIcon = classes.itemIcon;
      return (
        <ListItem
          key={key}
          className={cx(
            { [classes.item]: route.icon !== undefined },
            { [classes.collapseItem]: route.icon === undefined }
          )}
        >
          <NavLink
            to={route.path}
            className={cx(
              { [navLinkClasses]: route.icon !== undefined },
              { [innerNavLinkClasses]: route.icon === undefined }
            )}
          >
            {route.icon !== undefined ? (
              typeof route.icon === "string" ? (
                <Icon className={itemIcon}>{route.icon}</Icon>
              ) : (
                <route.icon className={itemIcon} />
              )
            ) : (
              <span className={collapseItemMini}>{route.mini}</span>
            )}
            <ListItemText
              primary={route.name}
              disableTypography={true}
              className={cx(
                { [itemText]: route.icon !== undefined },
                { [collapseItemText]: route.icon === undefined }
              )}
            />
          </NavLink>
        </ListItem>
      );
    });
  };
  const itemText =
    classes.itemText +
    " " +
    cx({
      [classes.itemTextMini]: props.miniActive && miniActive,
    });
  const collapseItemText =
    classes.collapseItemText +
    " " +
    cx({
      [classes.collapseItemTextMini]: props.miniActive && miniActive,
    });
  const userWrapperClass =
    classes.user +
    " " +
    cx({
      [classes.whiteAfter]: bgColor === "white",
    });
  const caret = classes.caret;
  const collapseItemMini = classes.collapseItemMini;
  const photo = classes.photo;
  let userDisplay = user && (
    <div className={userWrapperClass}>
      <Avatar className={photo} alt="...">
        <Person />
      </Avatar>
      <List className={classes.list}>
        <ListItem className={classes.item + " " + classes.userItem}>
          <NavLink
            to={"#"}
            className={classes.itemLink + " " + classes.userCollapseButton}
          >
            <ListItemText
              primary={user.username}
              disableTypography={true}
              className={itemText + " " + classes.userItemText}
            />
          </NavLink>
        </ListItem>
      </List>
    </div>
  );
  let links = (
    <List className={classes.list}>{createLinks(drawerRoutesToDisplay)}</List>
  );

  const logoNormal =
    classes.logoNormal +
    " " +
    cx({
      [classes.logoNormalSidebarMini]: props.miniActive && miniActive,
    });
  const logoMini = classes.logoMini;
  const logoClasses =
    classes.logo +
    " " +
    cx({
      [classes.whiteAfter]: bgColor === "white",
    });
  let brand = (
    <div className={logoClasses}>
      <a
        href={process.env.REACT_APP_DOMAIN}
        target="_blank"
        className={logoMini}
      >
        <img src={logo} alt="logo" className={classes.img} />
      </a>
      <a
        href={process.env.REACT_APP_DOMAIN}
        target="_blank"
        className={logoNormal}
      >
        {logoText}
      </a>
    </div>
  );
  const drawerPaper =
    classes.drawerPaper +
    " " +
    cx({
      [classes.drawerPaperMini]: props.miniActive && miniActive,
    });
  const sidebarWrapper =
    classes.sidebarWrapper +
    " " +
    cx({
      [classes.drawerPaperMini]: props.miniActive && miniActive,
    });
  return (
    <div ref={mainPanel}>
      <Hidden mdUp implementation="css">
        <Drawer
          variant="temporary"
          anchor="right"
          open={props.open}
          classes={{
            paper:
              drawerPaper +
              " " +
              // make ts shutup
              classes[(bgColor + "Background") as keyof typeof classes],
          }}
          onClose={props.handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
        >
          {brand}
          <SidebarWrapper
            className={sidebarWrapper}
            userDisplay={userDisplay}
            // headerLinks={<AdminNavbarLinks />}
            links={links}
          />
          {image !== undefined ? (
            <div
              className={classes.background}
              style={{ backgroundImage: "url(" + image + ")" }}
            />
          ) : null}
        </Drawer>
      </Hidden>
      <Hidden smDown implementation="css">
        <Drawer
          onMouseOver={() => setMiniActive(false)}
          onMouseOut={() => setMiniActive(true)}
          anchor={"left"}
          variant="permanent"
          open
          classes={{
            paper:
              drawerPaper +
              " " +
              classes[(bgColor + "Background") as keyof typeof classes],
          }}
        >
          {brand}
          <SidebarWrapper
            className={sidebarWrapper}
            userDisplay={userDisplay}
            links={links}
          />
          {image !== undefined ? (
            <div
              className={classes.background}
              style={{ backgroundImage: "url(" + image + ")" }}
            />
          ) : null}
        </Drawer>
      </Hidden>
    </div>
  );
}

export default Sidebar;
