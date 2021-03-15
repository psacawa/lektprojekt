// @material-ui/core components
import { makeStyles } from "@material-ui/core/styles";
import React from "react";

import styles from "../../assets/jss/styles/components/typographyStyle";

const useStyles = makeStyles(styles);

interface Props {
  children: React.ReactNode;
}

export default function Info(props: Props) {
  const classes = useStyles();
  const { children } = props;
  return (
    <div className={classes.defaultFontStyle + " " + classes.infoText}>
      {children}
    </div>
  );
}
