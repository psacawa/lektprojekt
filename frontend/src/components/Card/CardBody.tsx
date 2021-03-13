import { makeStyles } from "@material-ui/core/styles";
import classNames from "classnames";
import React from "react";

import styles from "../../assets/jss/styles/components/cardBodyStyle";

const useStyles = makeStyles(styles);

interface Props {
  className?: string;
  background?: boolean;
  plain?: boolean;
  formHorizontal?: boolean;
  pricing?: boolean;
  signup?: boolean;
  color?: boolean;
  profile?: boolean;
  calendar?: boolean;
  children?: React.ReactNode[];
}
export default function CardBody(props: Props) {
  const classes = useStyles();
  const {
    className,
    children,
    background,
    plain,
    formHorizontal,
    pricing,
    signup,
    color,
    profile,
    calendar,
    ...rest
  } = props;
  const cardBodyClasses = classNames({
    [classes.cardBody]: true,
    [classes.cardBodyBackground]: background,
    [classes.cardBodyPlain]: plain,
    [classes.cardBodyFormHorizontal]: formHorizontal,
    [classes.cardPricing]: pricing,
    [classes.cardSignup]: signup,
    [classes.cardBodyColor]: color,
    [classes.cardBodyProfile]: profile,
    [classes.cardBodyCalendar]: calendar,
    [className as string]: className !== undefined,
  });
  return (
    <div className={cardBodyClasses} {...rest}>
      {children}
    </div>
  );
}
