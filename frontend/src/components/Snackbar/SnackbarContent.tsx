import IconButton from "@material-ui/core/IconButton";
import Snack from "@material-ui/core/SnackbarContent";
// @material-ui/core components
import { makeStyles } from "@material-ui/core/styles";
// @material-ui/icons
import Close from "@material-ui/icons/Close";
import styles from "assets/jss/styles/components/snackbarContentStyle";
import clsx from "clsx";
import React from "react";

const useStyles = makeStyles(styles);

interface Props {
  message: React.ReactNode;
  color?: "info" | "success" | "warning" | "danger" | "primary" | "rose";
  close?: boolean;
  icon?: React.ComponentType<any>;
}
export default function SnackbarContent(props: Props) {
  const classes = useStyles();
  const { message, color = "info", close, icon } = props;
  let action: React.ReactElement[] = [];
  const messageClasses = clsx({
    [classes.iconMessage]: icon !== undefined,
  });
  if (close !== undefined) {
    action = [
      <IconButton
        aria-label="Close"
        className={classes.iconButton}
        color="inherit"
        key="close"
      >
        <Close className={classes.close} />
      </IconButton>,
    ];
  }
  const iconClasses = clsx({
    [classes.icon]: classes.icon,
    [classes.infoIcon]: color === "info",
    [classes.successIcon]: color === "success",
    [classes.warningIcon]: color === "warning",
    [classes.dangerIcon]: color === "danger",
    [classes.primaryIcon]: color === "primary",
    [classes.roseIcon]: color === "rose",
  });
  return (
    <Snack
      action={action}
      classes={{
        root: clsx(classes.root, classes[color]),
        message: classes.message,
      }}
      message={
        <div>
          {props.icon !== undefined ? (
            <props.icon className={iconClasses} />
          ) : null}
          <span className={messageClasses}>{message}</span>
        </div>
      }
    />
  );
}
