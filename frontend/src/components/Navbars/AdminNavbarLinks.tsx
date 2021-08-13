import ClickAwayListener from "@material-ui/core/ClickAwayListener";
import Divider from "@material-ui/core/Divider";
import Grow from "@material-ui/core/Grow";
import Hidden from "@material-ui/core/Hidden";
import MenuItem from "@material-ui/core/MenuItem";
import MenuList from "@material-ui/core/MenuList";
import Paper from "@material-ui/core/Paper";
import Popper from "@material-ui/core/Popper";
// @material-ui/core components
import { makeStyles } from "@material-ui/core/styles";
import Dashboard from "@material-ui/icons/Dashboard";
import Notifications from "@material-ui/icons/Notifications";
// @material-ui/icons
import Person from "@material-ui/icons/Person";
import Search from "@material-ui/icons/Search";
import styles from "assets/jss/styles/components/adminNavbarLinksStyle";
import clsx from "clsx";
import { Button } from "components/CustomButtons";
// core components
import CustomInput from "components/CustomInput";
import React from "react";

const useStyles = makeStyles(styles);

export default function HeaderLinks(props: {}) {
  const [openNotification, setOpenNotification] = React.useState<any | null>(
    null
  );
  const handleClickNotification = (event: React.MouseEvent<Element>) => {
    if (openNotification && openNotification.contains(event.target)) {
      setOpenNotification(null);
    } else {
      setOpenNotification(event.currentTarget);
    }
  };
  const handleCloseNotification = () => {
    setOpenNotification(null);
  };
  const [openProfile, setOpenProfile] = React.useState<HTMLElement | null>(
    null
  );
  const handleClickProfile = (event: React.MouseEvent<any>) => {
    if (openProfile && openProfile.contains(event.target as Node)) {
      setOpenProfile(null);
    } else {
      setOpenProfile(event.currentTarget);
    }
  };
  const handleCloseProfile = () => {
    setOpenProfile(null);
  };
  const classes = useStyles();
  const searchButton = classes.top + " " + classes.searchButton;
  const dropdownItem = clsx(classes.dropdownItem, classes.primaryHover);
  const managerClasses = clsx({
    [classes.managerClasses]: true,
  });
  return (
    <div>
      <CustomInput
        formControlProps={{
          className: classes.top + " " + classes.search,
        }}
        inputProps={{
          placeholder: "Search",
          inputProps: {
            "aria-label": "Search",
            className: classes.searchInput,
          },
        }}
      />
      <Button
        aria-label="edit"
        className={searchButton}
        color="white"
        justIcon
        round
      >
        <Search className={classes.headerLinksSvg + " " + classes.searchIcon} />
      </Button>
      <Button
        aria-label="Dashboard"
        className={classes.buttonLink}
        color="transparent"
        justIcon
        muiClasses={{
          label: "",
        }}
        simple
      >
        <Dashboard className={classes.headerLinksSvg + " " + classes.links} />
        <Hidden implementation="css" mdUp>
          <span className={classes.linkText}>{"Dashboard"}</span>
        </Hidden>
      </Button>
      <div className={managerClasses}>
        <Button
          aria-haspopup="true"
          aria-label="Notifications"
          aria-owns={openNotification ? "notification-menu-list" : undefined}
          className={classes.buttonLink}
          color="transparent"
          justIcon
          muiClasses={{
            label: "",
          }}
          onClick={handleClickNotification}
        >
          <Notifications
            className={classes.headerLinksSvg + " " + classes.links}
          />
          <span className={classes.notifications}>5</span>
          <Hidden implementation="css" mdUp>
            <span
              className={classes.linkText}
              onClick={handleClickNotification}
            >
              {"Notification"}
            </span>
          </Hidden>
        </Button>
        <Popper
          anchorEl={openNotification}
          className={clsx({
            [classes.popperClose]: !openNotification,
            [classes.popperResponsive]: true,
            [classes.popperNav]: true,
          })}
          disablePortal
          open={Boolean(openNotification)}
          placement="bottom"
          transition
        >
          {({ TransitionProps }) => (
            <Grow
              {...TransitionProps}
              // id="notification-menu-list"
              style={{ transformOrigin: "0 0 0" }}
            >
              <Paper className={classes.dropdown}>
                <ClickAwayListener onClickAway={handleCloseNotification}>
                  <MenuList role="menu">
                    <MenuItem
                      className={dropdownItem}
                      onClick={handleCloseNotification}
                    >
                      {"Mike John responded to your email"}
                    </MenuItem>
                    <MenuItem
                      className={dropdownItem}
                      onClick={handleCloseNotification}
                    >
                      {"You have 5 new tasks"}
                    </MenuItem>
                    <MenuItem
                      className={dropdownItem}
                      onClick={handleCloseNotification}
                    >
                      {"You're now friend with Andrew"}
                    </MenuItem>
                    <MenuItem
                      className={dropdownItem}
                      onClick={handleCloseNotification}
                    >
                      {"Another Notification"}
                    </MenuItem>
                    <MenuItem
                      className={dropdownItem}
                      onClick={handleCloseNotification}
                    >
                      {"Another One"}
                    </MenuItem>
                  </MenuList>
                </ClickAwayListener>
              </Paper>
            </Grow>
          )}
        </Popper>
      </div>

      <div className={managerClasses}>
        <Button
          aria-haspopup="true"
          aria-label="Person"
          aria-owns={openProfile ? "profile-menu-list" : undefined}
          className={classes.buttonLink}
          color="transparent"
          justIcon
          muiClasses={{
            label: "",
          }}
          onClick={handleClickProfile}
        >
          <Person className={clsx(classes.headerLinksSvg, classes.links)} />
          <Hidden implementation="css" mdUp>
            <span className={classes.linkText} onClick={handleClickProfile}>
              {"Profile"}
            </span>
          </Hidden>
        </Button>
        <Popper
          anchorEl={openProfile}
          className={clsx({
            [classes.popperClose]: !openProfile,
            [classes.popperResponsive]: true,
            [classes.popperNav]: true,
          })}
          disablePortal
          open={Boolean(openProfile)}
          placement="bottom"
          transition
        >
          {({ TransitionProps }) => (
            <Grow
              {...TransitionProps}
              // TODO 12/03/20 psacawa: figure the purpose of this out
              // id="profile-menu-list"
              style={{ transformOrigin: "0 0 0" }}
            >
              <Paper className={classes.dropdown}>
                <ClickAwayListener onClickAway={handleCloseProfile}>
                  <MenuList role="menu">
                    <MenuItem
                      className={dropdownItem}
                      onClick={handleCloseProfile}
                    >
                      {"Profile"}
                    </MenuItem>
                    <MenuItem
                      className={dropdownItem}
                      onClick={handleCloseProfile}
                    >
                      {"Settings"}
                    </MenuItem>
                    <Divider light />
                    <MenuItem
                      className={dropdownItem}
                      onClick={handleCloseProfile}
                    >
                      {"Log out"}
                    </MenuItem>
                  </MenuList>
                </ClickAwayListener>
              </Paper>
            </Grow>
          )}
        </Popper>
      </div>
    </div>
  );
}
