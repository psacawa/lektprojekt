import IconButton from "@material-ui/core/IconButton";
import MuiSnackBar from "@material-ui/core/Snackbar";
// @material-ui/core components
import { makeStyles } from "@material-ui/core/styles";
// @material-ui/icons
import Close from "@material-ui/icons/Close";
import styles from "assets/jss/styles/components/snackbarContentStyle";
import cx from "classnames";
import React from "react";

const useStyles = makeStyles(styles);

interface Props {
  message: React.ReactNode[];
  color?: "info" | "success" | "warning" | "danger" | "primary" | "rose";
  close?: boolean;
  icon?: React.ComponentType<any>;
  place?: "tl" | "tr" | "tc" | "br" | "bl" | "bc";
  open?: boolean;
  handleClose?: (ev: React.MouseEvent<HTMLElement>) => void;
}

export default function Snackbar(props: Props) {
  const classes = useStyles();
  const { message, color = "info", close, icon, place, open } = props;
  let action: React.ReactElement[] = [];
  const messageClasses = cx({
    [classes.iconMessage]: icon !== undefined,
  });
  if (close !== undefined) {
    action = [
      <IconButton
        className={classes.iconButton}
        key="close"
        aria-label="Close"
        color="inherit"
        onClick={props.handleClose!}
      >
        <Close className={classes.close} />
      </IconButton>,
    ];
  }
  const iconClasses = cx({
    [classes.icon]: classes.icon,
    [classes.infoIcon]: color === "info",
    [classes.successIcon]: color === "success",
    [classes.warningIcon]: color === "warning",
    [classes.dangerIcon]: color === "danger",
    [classes.primaryIcon]: color === "primary",
    [classes.roseIcon]: color === "rose",
  });
  return (
    <MuiSnackBar
      classes={{
        anchorOriginTopCenter: classes.top20,
        anchorOriginTopRight: classes.top40,
        anchorOriginTopLeft: classes.top40,
      }}
      anchorOrigin={{
        vertical: place?.indexOf("t") === -1 ? "bottom" : "top",
        horizontal:
          place?.indexOf("l") !== -1
            ? "left"
            : place.indexOf("c") !== -1
            ? "center"
            : "right",
      }}
      open={open}
      message={
        <div>
          {props.icon !== undefined ? (
            <props.icon className={iconClasses} />
          ) : null}
          <span className={messageClasses}>{message}</span>
        </div>
      }
      action={action}
      ContentProps={{
        classes: {
          root: classes.root + " " + classes[color],
          message: classes.message,
        },
      }}
    />
  );
}
