import { makeStyles } from "@material-ui/core/styles";
import styles from "assets/jss/styles/components/typographyStyle";
import React from "react";

const useStyles = makeStyles(styles);

interface Props {
  children: React.ReactNode;
}

export default function Primary(props: Props) {
  const classes = useStyles();
  const { children } = props;
  return (
    <div className={classes.defaultFontStyle + " " + classes.primaryText}>
      {children}
    </div>
  );
}
