// @material-ui/core components
import { makeStyles } from "@material-ui/core/styles";
import styles from "assets/jss/styles/components/typographyStyle";
import React from "react";

const useStyles = makeStyles(styles);

interface Props {
  children: React.ReactNode;
  text: string;
  author: string;
}

export default function Quote(props: Props) {
  const classes = useStyles();
  const { text, author } = props;
  return (
    <blockquote className={classes.defaultFontStyle + " " + classes.quote}>
      <p className={classes.quoteText}>{text}</p>
      <small className={classes.quoteAuthor}>{author}</small>
    </blockquote>
  );
}
