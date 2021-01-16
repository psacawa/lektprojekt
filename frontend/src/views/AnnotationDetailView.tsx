import { CircularProgress, Grid, Typography } from "@material-ui/core";
import React from "react";
import { useParams } from "react-router";

import { useAnnotation } from "../clientHooks";

const LexemeDetailView = () => {
  const { id } = useParams<any>();
  const { isSuccess, data: annotation } = useAnnotation({ id });
  return (
    <Grid container justify="center">
      {isSuccess ? (
        <>
          <Typography variant="h5">{annotation?.description}</Typography>
        </>
      ) : (
        <Grid item>
          <CircularProgress style={{ margin: "auto" }} />
        </Grid>
      )}
    </Grid>
  );
};

export default LexemeDetailView;
