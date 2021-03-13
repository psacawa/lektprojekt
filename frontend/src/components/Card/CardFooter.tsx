import { makeStyles } from "@material-ui/core/styles";
import classNames from "classnames";
import React from "react";

import styles from "../../assets/jss/styles/components/cardFooterStyle";

const useStyles = makeStyles(styles);

interface Props {
  className?: string;
  plain?: boolean;
  profile?: boolean;
  pricing?: boolean;
  testimonial?: boolean;
  stats?: boolean;
  chart?: boolean;
  product?: boolean;
  children?: React.ReactNode[];
}
export default function CardFooter(props: Props) {
  const classes = useStyles();
  const {
    className,
    children,
    plain,
    profile,
    pricing,
    testimonial,
    stats,
    chart,
    product,
    ...rest
  } = props;
  const cardFooterClasses = classNames({
    [classes.cardFooter]: true,
    [classes.cardFooterPlain]: plain,
    [classes.cardFooterProfile]: profile || testimonial,
    [classes.cardFooterPricing]: pricing,
    [classes.cardFooterTestimonial]: testimonial,
    [classes.cardFooterStats]: stats,
    [classes.cardFooterChart]: chart || product,
    [className as string]: className !== undefined,
  });
  return (
    <div className={cardFooterClasses} {...rest}>
      {children}
    </div>
  );
}
