import { makeStyles } from "@material-ui/core/styles";
import styles from "assets/jss/styles/components/cardHeaderStyle";
import classNames from "classnames";
import React from "react";

const useStyles = makeStyles(styles);

interface Props {
  className?: string;
  color?: "warning" | "success" | "danger" | "info" | "primary" | "rose";
  plain?: boolean;
  image?: boolean;
  contact?: boolean;
  signup?: boolean;
  stats?: boolean;
  icon?: boolean;
  text?: boolean;
  children?: React.ReactNode[];
}
export default function CardHeader(props: Props) {
  const classes = useStyles();
  const {
    className,
    children,
    color,
    plain,
    image,
    contact,
    signup,
    stats,
    icon,
    text,
    ...rest
  } = props;
  const cardHeaderClasses = classNames({
    [classes.cardHeader]: true,
    [classes[(color + "CardHeader") as keyof typeof classes]]: color,
    [classes.cardHeaderPlain]: plain,
    [classes.cardHeaderImage]: image,
    [classes.cardHeaderContact]: contact,
    [classes.cardHeaderSignup]: signup,
    [classes.cardHeaderStats]: stats,
    [classes.cardHeaderIcon]: icon,
    [classes.cardHeaderText]: text,
    [className as string]: className !== undefined,
  });
  return (
    <div className={cardHeaderClasses} {...rest}>
      {children}
    </div>
  );
}
