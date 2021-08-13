import Button, { ButtonProps } from "@material-ui/core/Button";
// material-ui components
import { makeStyles } from "@material-ui/core/styles";
import styles from "assets/jss/styles/components/buttonStyle";
// nodejs library that concatenates classes
import clsx from "clsx";
// nodejs library to set properties for components
import React from "react";

const useStyles = makeStyles(styles as any);

interface Props extends Omit<ButtonProps, "color" | "size"> {
  color?:
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
  size?: "sm" | "lg";
  simple?: boolean;
  round?: boolean;
  fullWidth?: boolean;
  disabled?: boolean;
  block?: boolean;
  link?: boolean;
  justIcon?: boolean;
  className?: string;
  muiClasses?: object;
}

// TODO 16/03/20 psacawa: figure out the typing situation re encapsulated components
// so this doesn't have to be "any"
const RegularButton = React.forwardRef((props: any, ref) => {
  const classes = useStyles();
  const {
    color = "primary",
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
  const btnClasses = clsx({
    [classes.button]: true,
    // TODO 16/03/20 psacawa: this essentially addes a key "underfined" in the object
    // need to clean house with this MDR prop js nonsense
    [classes[size!]]: size,
    [classes[color]]: color,
    [classes.round]: round,
    [classes.fullWidth]: fullWidth,
    [classes.disabled]: disabled,
    [classes.simple]: simple,
    [classes.block]: block,
    [classes.link]: link,
    [classes.justIcon]: justIcon,
    [className!]: className,
  });
  return (
    <Button
      {...(rest as any)}
      className={btnClasses}
      classes={muiClasses}
      ref={ref}
    >
      {children}
    </Button>
  );
});

export default RegularButton;
