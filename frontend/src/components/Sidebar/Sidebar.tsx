/*eslint-disable*/
import React from "react";
// javascript plugin used to create scrollbars on windows
import PerfectScrollbar from "perfect-scrollbar";
import { NavLink } from "react-router-dom";
import cx from "classnames";

// @material-ui/core components
import withStyles from "@material-ui/core/styles/withStyles";
import Drawer from "@material-ui/core/Drawer";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Hidden from "@material-ui/core/Hidden";
import Collapse from "@material-ui/core/Collapse";
import Icon from "@material-ui/core/Icon";

// core components
import { AdminNavbarLinks } from "../../components/Navbars";

import sidebarStyle from "../../assets/jss/material-dashboard-pro-react/components/sidebarStyle";

import avatar from "../../assets/img/faces/avatar.jpg";
import { AppRoute } from "../../routes";
import { Avatar } from "@material-ui/core";
import { Person } from "@material-ui/icons";

let ps: PerfectScrollbar;

interface SidebarWrapperProps {
  className: string;
  user: object;
  headerLinks?: object;
  links: object;
}

// We've created this component so we can have a ref to the wrapper of the links that appears in our sidebar.
// This was necessary so that we could initialize PerfectScrollbar on the links.
// There might be something with the Hidden component from material-ui, and we didn't have access to
// the links, and couldn't initialize the plugin.
class SidebarWrapper extends React.Component<SidebarWrapperProps> {
  sidebarWrapper = React.createRef<HTMLDivElement>();
  componentDidMount() {
    if (navigator.platform.indexOf("Win") > -1) {
      ps = new PerfectScrollbar(this.sidebarWrapper.current!, {
        suppressScrollX: true,
        suppressScrollY: false,
      });
    }
  }
  componentWillUnmount() {
    if (navigator.platform.indexOf("Win") > -1) {
      ps.destroy();
    }
  }
  render() {
    const { className, user, headerLinks, links } = this.props;
    return (
      <div className={className} ref={this.sidebarWrapper}>
        {user}
        {headerLinks}
        {links}
      </div>
    );
  }
}

interface SidebarProps {
  classes: any;
  bgColor: "white" | "black" | "blue";
  color: "white" | "red" | "orange" | "green" | "blue" | "purple" | "rose";
  logo: string;
  logoText: string;
  image: string;
  routes: AppRoute[];
  miniActive: boolean;
  open: boolean;
  handleDrawerToggle: (ev: React.MouseEvent<any>) => void;
}

interface SidebarState {
  openAvatar: boolean;
  miniActive: boolean;
}

class Sidebar extends React.Component<SidebarProps, any> {
  constructor(props: SidebarProps) {
    super(props);
    this.state = {
      openAvatar: false,
      miniActive: true,
      ...this.getCollapseStates(props.routes),
    };
  }
  mainPanel = React.createRef<HTMLDivElement>();
  // this creates the intial state of this component based on the collapse routes
  // that it gets through this.props.routes
  getCollapseStates = (routes: AppRoute[]) => {
    let initialState = {};
    routes.map((prop) => {
      if ("collapse" in prop) {
        initialState = {
          [prop.state]: this.getCollapseInitialState(prop.views),
          ...this.getCollapseStates(prop.views),
          ...initialState,
        };
      }
      return null;
    });
    return initialState;
  };
  // this verifies if any of the collapses should be default opened on a rerender of this component
  // for example, on the refresh of the page,
  // while on the src/views/forms/RegularFormsx - route /admin/regular-forms
  getCollapseInitialState(routes: AppRoute[]) {
    for (let route of routes) {
      if ("collapse" in route && this.getCollapseInitialState(route.views)) {
        return true;
      } else if (window.location.href.indexOf(route.path) !== -1) {
        return true;
      }
    }
    return false;
  }
  // verifies if routeName is the one active (in browser input)
  activeRoute = (routeName: string) => {
    return window.location.href.indexOf(routeName) > -1 ? "active" : "";
  };
  openCollapse(collapse: string) {
    let st: any = {};
    st[collapse] = !this.state[collapse];
    this.setState(st);
  }
  // this function creates the links and collapses that appear in the sidebar (left menu)
  createLinks = (routes: AppRoute[]) => {
    const { classes, color } = this.props;
    return routes.map((route, key) => {
      if ("redirect" in route) {
        return null;
      }
      if ("collapse" in route) {
        let st: any = {};
        st[route["state"]] = !this.state[route.state];
        const navLinkClasses =
          classes.itemLink +
          " " +
          cx({
            [" " + classes.collapseActive]: this.getCollapseInitialState(
              route.views
            ),
          });
        const itemText =
          classes.itemText +
          " " +
          cx({
            [classes.itemTextMini]:
              this.props.miniActive && this.state.miniActive,
          });
        const collapseItemText =
          classes.collapseItemText +
          " " +
          cx({
            [classes.collapseItemTextMini]:
              this.props.miniActive && this.state.miniActive,
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
                this.setState(st);
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
                      (this.state[route.state] ? classes.caretActive : "")
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
            <Collapse in={this.state[route.state]} unmountOnExit>
              <List className={classes.list + " " + classes.collapseList}>
                {this.createLinks(route.views)}
              </List>
            </Collapse>
          </ListItem>
        );
      }
      const innerNavLinkClasses =
        classes.collapseItemLink +
        " " +
        cx({
          [" " + classes[color]]: this.activeRoute(route.path),
        });
      const collapseItemMini = classes.collapseItemMini;
      const navLinkClasses =
        classes.itemLink +
        " " +
        cx({
          [" " + classes[color]]: this.activeRoute(route.path),
        });
      const itemText =
        classes.itemText +
        " " +
        cx({
          [classes.itemTextMini]:
            this.props.miniActive && this.state.miniActive,
        });
      const collapseItemText =
        classes.collapseItemText +
        " " +
        cx({
          [classes.collapseItemTextMini]:
            this.props.miniActive && this.state.miniActive,
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
  render() {
    const { classes, logo, image, logoText, routes, bgColor } = this.props;
    const itemText =
      classes.itemText +
      " " +
      cx({
        [classes.itemTextMini]: this.props.miniActive && this.state.miniActive,
      });
    const collapseItemText =
      classes.collapseItemText +
      " " +
      cx({
        [classes.collapseItemTextMini]:
          this.props.miniActive && this.state.miniActive,
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
    let user = (
      <div className={userWrapperClass}>
        <Avatar className={photo} alt="...">
          <Person />
        </Avatar>
        <List className={classes.list}>
          <ListItem className={classes.item + " " + classes.userItem}>
            <NavLink
              to={"#"}
              className={classes.itemLink + " " + classes.userCollapseButton}
              onClick={() => this.openCollapse("openAvatar")}
            >
              <ListItemText
                primary={"Tania Andrew"}
                secondary={
                  <b
                    className={
                      caret +
                      " " +
                      classes.userCaret +
                      " " +
                      (this.state.openAvatar ? classes.caretActive : "")
                    }
                  />
                }
                disableTypography={true}
                className={itemText + " " + classes.userItemText}
              />
            </NavLink>
            <Collapse in={this.state.openAvatar} unmountOnExit>
              <List className={classes.list + " " + classes.collapseList}>
                <ListItem className={classes.collapseItem}>
                  <NavLink
                    to="#"
                    className={
                      classes.itemLink + " " + classes.userCollapseLinks
                    }
                  >
                    <span className={collapseItemMini}>{"MP"}</span>
                    <ListItemText
                      primary={"My Profile"}
                      disableTypography={true}
                      className={collapseItemText}
                    />
                  </NavLink>
                </ListItem>
                <ListItem className={classes.collapseItem}>
                  <NavLink
                    to="#"
                    className={
                      classes.itemLink + " " + classes.userCollapseLinks
                    }
                  >
                    <span className={collapseItemMini}>{"EP"}</span>
                    <ListItemText
                      primary={"Edit Profile"}
                      disableTypography={true}
                      className={collapseItemText}
                    />
                  </NavLink>
                </ListItem>
                <ListItem className={classes.collapseItem}>
                  <NavLink
                    to="#"
                    className={
                      classes.itemLink + " " + classes.userCollapseLinks
                    }
                  >
                    <span className={collapseItemMini}>{"S"}</span>
                    <ListItemText
                      primary={"Settings"}
                      disableTypography={true}
                      className={collapseItemText}
                    />
                  </NavLink>
                </ListItem>
              </List>
            </Collapse>
          </ListItem>
        </List>
      </div>
    );
    let links = (
      <List className={classes.list}>{this.createLinks(routes)}</List>
    );

    const logoNormal =
      classes.logoNormal +
      " " +
      cx({
        [classes.logoNormalSidebarMini]:
          this.props.miniActive && this.state.miniActive,
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
          href="https://www.creative-tim.com?ref=mdpr-sidebar"
          target="_blank"
          className={logoMini}
        >
          <img src={logo} alt="logo" className={classes.img} />
        </a>
        <a
          href="https://www.creative-tim.com?ref=mdpr-sidebar"
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
        [classes.drawerPaperMini]:
          this.props.miniActive && this.state.miniActive,
      });
    const sidebarWrapper =
      classes.sidebarWrapper +
      " " +
      cx({
        [classes.drawerPaperMini]:
          this.props.miniActive && this.state.miniActive,
        [classes.sidebarWrapperWithPerfectScrollbar]:
          navigator.platform.indexOf("Win") > -1,
      });
    return (
      <div ref={this.mainPanel}>
        <Hidden mdUp implementation="css">
          <Drawer
            variant="temporary"
            anchor={"right"}
            open={this.props.open}
            classes={{
              paper: drawerPaper + " " + classes[bgColor + "Background"],
            }}
            onClose={this.props.handleDrawerToggle}
            ModalProps={{
              keepMounted: true, // Better open performance on mobile.
            }}
          >
            {brand}
            <SidebarWrapper
              className={sidebarWrapper}
              user={user}
              headerLinks={<AdminNavbarLinks />}
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
            onMouseOver={() => this.setState({ miniActive: false })}
            onMouseOut={() => this.setState({ miniActive: true })}
            anchor={"left"}
            variant="permanent"
            open
            classes={{
              paper: drawerPaper + " " + classes[bgColor + "Background"],
            }}
          >
            {brand}
            <SidebarWrapper
              className={sidebarWrapper}
              user={user}
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
}

(Sidebar as any).defaultProps = {
  bgColor: "blue",
};

export default withStyles(sidebarStyle)(Sidebar);
