import { CircularProgress, Grid, Typography } from "@material-ui/core";
import React from "react";
import { useParams } from "react-router";

import { useFeature } from "../hooks";

const LexemeDetailView = () => {
  const { id } = useParams<any>();
  const { isSuccess, data: feature } = useFeature({ id });
  return (
    <Grid container justify="center">
      {isSuccess ? (
        <>
          <Typography variant="h5">{feature?.description}</Typography>
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
