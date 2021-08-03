import { makeStyles } from "@material-ui/core/styles";
import styles from "assets/jss/styles/components/cardTextStyle";
import classNames from "classnames";
import React from "react";

const useStyles = makeStyles(styles);

interface Props {
  className?: string;
  color?: "warning" | "success" | "danger" | "info" | "primary" | "rose";
  children?: React.ReactNode[];
}

export default function CardText(props: Props) {
  const classes = useStyles();
  const { className, children, color, ...rest } = props;
  const cardTextClasses = classNames({
    [classes.cardText]: true,
    [classes[(color + "CardHeader") as keyof typeof classes]]: color,
    [className as string]: className !== undefined,
  });
  return (
    <div className={cardTextClasses} {...rest}>
      {children}
    </div>
  );
}
