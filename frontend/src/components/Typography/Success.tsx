// @material-ui/core components
import { makeStyles } from "@material-ui/core/styles";
import React from "react";

import styles from "../../assets/jss/styles/components/typographyStyle";

const useStyles = makeStyles(styles);

interface Props {
  children: React.ReactNode;
}

export default function Success(props: Props) {
  const classes = useStyles();
  const { children } = props;
  return (
    <div className={classes.defaultFontStyle + " " + classes.successText}>
      {children}
    </div>
  );
}
