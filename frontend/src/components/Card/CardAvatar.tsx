import { makeStyles } from "@material-ui/core/styles";
import styles from "assets/jss/styles/components/cardAvatarStyle";
import clsx from "clsx";
import React from "react";

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
  const cardAvatarClasses = clsx({
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
