import Button from "@material-ui/core/Button";
// material-ui components
import { makeStyles } from "@material-ui/core/styles";
// nodejs library that concatenates classes
import classNames from "classnames";
// nodejs library to set properties for components
import React from "react";

import styles from "../../assets/jss/styles/components/buttonStyle";

const useStyles = makeStyles(styles as any);

interface Props {
  color:
    | "primary"
    | "info"
    | "success"
    | "warning"
    | "danger"
    | "rose"
    | "white"
    | "twitter"
    | "facebook"
    | "google"
    | "linkedin"
    | "pinterest"
    | "youtube"
    | "tumblr"
    | "github"
    | "behance"
    | "dribbble"
    | "reddit"
    | "transparent";
  size: "sm" | "lg";
  simple: boolean;
  round: boolean;
  fullWidth: boolean;
  disabled: boolean;
  block: boolean;
  link: boolean;
  justIcon: boolean;
  className: string;
  muiClasses: object;
}

const RegularButton = React.forwardRef((props: any, ref) => {
  const classes = useStyles();
  const {
    color,
    round,
    children,
    fullWidth,
    disabled,
    simple,
    size,
    block,
    link,
    justIcon,
    className,
    muiClasses,
    ...rest
  } = props;
  const btnClasses = classNames({
    [classes.button]: true,
    [classes[size]]: size,
    [classes[color]]: color,
    [classes.round]: round,
    [classes.fullWidth]: fullWidth,
    [classes.disabled]: disabled,
    [classes.simple]: simple,
    [classes.block]: block,
    [classes.link]: link,
    [classes.justIcon]: justIcon,
    [className]: className,
  });
  return (
    <Button {...rest} ref={ref} classes={muiClasses} className={btnClasses}>
      {children}
    </Button>
  );
});

export default RegularButton;
