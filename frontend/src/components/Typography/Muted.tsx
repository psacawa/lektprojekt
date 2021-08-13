import { makeStyles } from "@material-ui/core/styles";
import styles from "assets/jss/styles/components/typographyStyle";
import clsx from "clsx";
import React from "react";

const useStyles = makeStyles(styles);

interface Props {
  children: React.ReactNode;
}

export default function Muted(props: Props) {
  const classes = useStyles();
  const { children } = props;
  return (
    <div className={clsx(classes.defaultFontStyle, classes.mutedText)}>
      {children}
    </div>
  );
}
