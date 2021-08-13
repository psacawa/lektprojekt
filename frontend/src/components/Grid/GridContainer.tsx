import Grid from "@material-ui/core/Grid";
import { GridProps } from "@material-ui/core/Grid";
import { createStyles, makeStyles } from "@material-ui/core/styles";
import clsx from "clsx";
import React from "react";

const styles = createStyles({
  grid: {
    margin: "0 -15px",
    width: "calc(100% + 30px)",
  },
});

interface Props extends GridProps {
  className?: string;
  children: React.ReactNode;
}
const useStyles = makeStyles(styles);

export default function GridContainer(props: Props) {
  const classes = useStyles();
  const { children, className, ...rest } = props;
  return (
    <Grid container {...rest} className={clsx(classes.grid, className)}>
      {children}
    </Grid>
  );
}
