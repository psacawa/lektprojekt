// @material-ui/core components
import { makeStyles } from "@material-ui/core/styles";
// nodejs library that concatenates classes
import classNames from "classnames";
import React from "react";

// @material-ui/icons
// core components
import styles from "../../assets/jss/styles/components/cardAvatarStyle";

const useStyles = makeStyles(styles);

interface Props {
  children: React.ReactNode[];
  className?: string;
  profile?: boolean;
  plain?: boolean;
  testimonial?: boolean;
  testimonialFooter?: boolean;
}

export default function CardAvatar(props: Props) {
  const classes = useStyles();
  const {
    children,
    className,
    plain,
    profile,
    testimonial,
    testimonialFooter,
    ...rest
  } = props;
  const cardAvatarClasses = classNames({
    [classes.cardAvatar]: true,
    [classes.cardAvatarProfile]: profile,
    [classes.cardAvatarPlain]: plain,
    [classes.cardAvatarTestimonial]: testimonial,
    [classes.cardAvatarTestimonialFooter]: testimonialFooter,
    [className as string]: className !== undefined,
  });
  return (
    <div className={cardAvatarClasses} {...rest}>
      {children}
    </div>
  );
}
