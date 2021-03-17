import { makeStyles } from "@material-ui/core/styles";
import styles from "assets/jss/styles/components/cardIconStyle";
import classNames from "classnames";
import React from "react";

const useStyles = makeStyles(styles);

interface Props {
  className?: string;
  color?: "warning" | "success" | "danger" | "info" | "primary" | "rose";
  children?: React.ReactNode[];
}

export default function CardIcon(props: Props) {
  const classes = useStyles();
  const { className, children, color, ...rest } = props;
  const cardIconClasses = classNames({
    [classes.cardIcon]: true,
    [classes[(color + "CardHeader") as keyof typeof classes]]: color,
    [className as string]: className !== undefined,
  });
  return (
    <div className={cardIconClasses} {...rest}>
      {children}
    </div>
  );
}
