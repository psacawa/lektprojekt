import { makeStyles } from "@material-ui/core/styles";
import classNames from "classnames";
import React, { ReactNode } from "react";

import styles from "../../assets/jss/styles/components/cardStyle";

const useStyles = makeStyles(styles);

interface Props {
  className?: string;
  plain?: boolean;
  profile?: boolean;
  blog?: boolean;
  raised?: boolean;
  background?: boolean;
  pricing?: boolean;
  testimonial?: boolean;
  color?: "primary" | "info" | "success" | "warning" | "danger" | "rose";
  product?: boolean;
  chart?: boolean;
  login?: boolean;
  children: ReactNode[];
}

function Card(props: Props) {
  const classes = useStyles();
  const {
    className,
    children,
    plain,
    profile,
    blog,
    raised,
    background,
    pricing,
    color,
    product,
    testimonial,
    chart,
    login,
    ...rest
  } = props;
  const cardClasses = classNames({
    [classes.card]: true,
    [classes.cardPlain]: plain,
    [classes.cardProfile]: profile || testimonial,
    [classes.cardBlog]: blog,
    [classes.cardRaised]: raised,
    [classes.cardBackground]: background,
    [classes.cardPricingColor]:
      (pricing && color !== undefined) || (pricing && background !== undefined),
    [classes[color as keyof typeof classes]]: color,
    [classes.cardPricing]: pricing,
    [classes.cardProduct]: product,
    [classes.cardChart]: chart,
    [classes.cardLogin]: login,
    [className as string]: className !== undefined,
  });
  return (
    <div className={cardClasses} {...rest}>
      {children}
    </div>
  );
}
export default Card;
