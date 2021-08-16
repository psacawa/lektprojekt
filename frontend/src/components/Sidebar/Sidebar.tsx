import { makeStyles } from "@material-ui/core";
import Collapse from "@material-ui/core/Collapse";
import Drawer from "@material-ui/core/Drawer";
import Hidden from "@material-ui/core/Hidden";
import Icon from "@material-ui/core/Icon";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import sidebarStyle from "assets/jss/styles/components/sidebarStyle";
import clsx from "clsx";
import Avatar from "components/Avatar";
import { useAuth } from "hooks/auth";
import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";

import { AppRoute, baseDrawerRoutes } from "../../routes";

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
  const drawerRoutesToDisplay = baseDrawerRoutes.filter(
    (route) =>
      (!!user && route.login !== "disallowed") ||
      (!user && route.login !== "required")
  );
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

  const [miniActive, setMiniActive] = useState(true);
  const [routeCollapse, setRouteCollapse] = useState(
    getCollapseStates(drawerRoutesToDisplay)
  );
  const mainPanel = React.useRef<any>();

  // verifies if routeName is the one active (in browser input)
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
        const navLinkClasses = clsx(classes.itemLink, {
          [classes.collapseActive]: getCollapseInitialState(route.views),
        });
        const itemText = clsx(classes.itemText, {
          [classes.itemTextMini]: props.miniActive && miniActive,
        });
        const collapseItemText = clsx(classes.collapseItemText, {
          [classes.collapseItemTextMini]: props.miniActive && miniActive,
        });
        const itemIcon = classes.itemIcon;
        const caret = classes.caret;
        const collapseItemMini = classes.collapseItemMini;
        return (
          <ListItem
            className={clsx(
              { [classes.item]: route.icon !== undefined },
              { [classes.collapseItem]: route.icon === undefined }
            )}
            key={key}
          >
            <NavLink
              className={navLinkClasses}
              onClick={(e) => {
                e.preventDefault();
                setRouteCollapse(newCollapseState);
              }}
              to={"#"}
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
                className={clsx(
                  { [itemText]: route.icon !== undefined },
                  { [collapseItemText]: route.icon === undefined }
                )}
                disableTypography={true}
                primary={route.name}
                secondary={
                  <b
                    className={clsx(
                      caret,
                      routeCollapse[route.state] && classes.caretActive
                    )}
                  />
                }
              />
            </NavLink>
            <Collapse in={routeCollapse[route.state]} unmountOnExit>
              <List className={clsx(classes.list, classes.collapseList)}>
                {createLinks(route.views)}
              </List>
            </Collapse>
          </ListItem>
        );
      }
      const innerNavLinkClasses = clsx(classes.collapseItemLink, {
        [classes[color]]: location.pathname === route.path,
      });
      const collapseItemMini = classes.collapseItemMini;
      const navLinkClasses = clsx(classes.itemLink, {
        [classes[color]]: location.pathname === route.path,
      });
      const itemText = clsx(classes.itemText, {
        [classes.itemTextMini]: props.miniActive && miniActive,
      });
      const collapseItemText = clsx(classes.collapseItemText, {
        [classes.collapseItemTextMini]: props.miniActive && miniActive,
      });
      const itemIcon = classes.itemIcon;
      return (
        <ListItem
          className={clsx({
            [classes.item]: route.icon !== undefined,
            [classes.collapseItem]: route.icon === undefined,
          })}
          key={key}
        >
          <NavLink
            className={clsx({
              [navLinkClasses]: route.icon !== undefined,
              [innerNavLinkClasses]: route.icon === undefined,
            })}
            to={route.path}
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
              className={clsx({
                [itemText]: route.icon !== undefined,
                [collapseItemText]: route.icon === undefined,
              })}
              disableTypography={true}
              primary={route.name}
            />
          </NavLink>
        </ListItem>
      );
    });
  };
  const itemText = clsx(classes.itemText, {
    [classes.itemTextMini]: props.miniActive && miniActive,
  });
  const collapseItemText = clsx(classes.collapseItemText, {
    [classes.collapseItemTextMini]: props.miniActive && miniActive,
  });
  const userWrapperClass = clsx(classes.user, {
    [classes.whiteAfter]: bgColor === "white",
  });
  const caret = classes.caret;
  const collapseItemMini = classes.collapseItemMini;
  let userDisplay = user && (
    <div className={userWrapperClass}>
      <Avatar className={classes.photo} />
      <List className={classes.list}>
        <ListItem className={clsx(classes.item, classes.userItem)}>
          <NavLink
            className={clsx(classes.itemLink, classes.userCollapseButton)}
            to={"#"}
          >
            <ListItemText
              className={clsx(itemText, classes.userItemText)}
              disableTypography={true}
              primary={user.username}
            />
          </NavLink>
        </ListItem>
      </List>
    </div>
  );
  let links = (
    <List className={classes.list}>{createLinks(drawerRoutesToDisplay)}</List>
  );

  const logoNormal = clsx(classes.logoNormal, {
    [classes.logoNormalSidebarMini]: props.miniActive && miniActive,
  });
  const logoMini = classes.logoMini;
  const logoClasses = clsx(classes.logo, {
    [classes.whiteAfter]: bgColor === "white",
  });
  let brand = (
    <div className={logoClasses}>
      {/* TODO 21/03/20 psacawa: change to Link */}
      <a
        className={logoMini}
        href={`https://${process.env.REACT_WEB_DOMAIN}`}
        rel="noreferrer"
        target="_blank"
      >
        <img alt="logo" className={classes.img} src={logo} />
      </a>
      <a
        className={logoNormal}
        href={`https://${process.env.REACT_WEB_DOMAIN}`}
        rel="noreferrer"
        target="_blank"
      >
        {logoText}
      </a>
    </div>
  );
  const drawerPaper = clsx(classes.drawerPaper, {
    [classes.drawerPaperMini]: props.miniActive && miniActive,
  });
  const sidebarWrapper = clsx(classes.sidebarWrapper, {
    [classes.drawerPaperMini]: props.miniActive && miniActive,
  });
  return (
    <div ref={mainPanel}>
      <Hidden implementation="css" mdUp>
        <Drawer
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          anchor="right"
          classes={{
            paper:
              drawerPaper +
              " " +
              // make ts shutup
              classes[(bgColor + "Background") as keyof typeof classes],
          }}
          onClose={props.handleDrawerToggle}
          open={props.open}
          variant="temporary"
        >
          {brand}
          <SidebarWrapper
            className={sidebarWrapper}
            links={links}
            // headerLinks={<AdminNavbarLinks />}
            userDisplay={userDisplay}
          />
          {image !== undefined ? (
            <div
              className={classes.background}
              style={{ backgroundImage: `url(${image})` }}
            />
          ) : null}
        </Drawer>
      </Hidden>
      <Hidden implementation="css" smDown>
        <Drawer
          anchor={"left"}
          classes={{
            paper:
              drawerPaper +
              " " +
              classes[(bgColor + "Background") as keyof typeof classes],
          }}
          onMouseOut={() => setMiniActive(true)}
          onMouseOver={() => setMiniActive(false)}
          open
          variant="permanent"
        >
          {brand}
          <SidebarWrapper
            className={sidebarWrapper}
            links={links}
            userDisplay={userDisplay}
          />
          {image !== undefined ? (
            <div
              className={classes.background}
              style={{ backgroundImage: `url(${image})` }}
            />
          ) : null}
        </Drawer>
      </Hidden>
    </div>
  );
}

export default Sidebar;
