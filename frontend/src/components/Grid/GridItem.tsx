import Grid from "@material-ui/core/Grid";
import { GridProps } from "@material-ui/core/Grid";
import { createStyles, makeStyles } from "@material-ui/core/styles";
import clsx from "clsx";
import React from "react";

const styles = createStyles({
  grid: {
    padding: "0 15px !important",
  },
});

const useStyles = makeStyles(styles);

interface Props extends GridProps {
  className?: string;
  children: React.ReactNode;
}

export default function GridItem(props: Props) {
  const classes = useStyles();
  const { children, className, ...rest } = props;
  return (
    <Grid item {...rest} className={clsx(classes.grid, className)}>
      {children}
    </Grid>
  );
}
