import { Grid } from "@material-ui/core";
import { CircularProgress, Typography } from "@material-ui/core";
import React from "react";
import { useParams } from "react-router";

import { useLexeme } from "../hooks";

const LexemeDetailView = () => {
  const { id } = useParams<any>();
  const { isSuccess, data: lexeme } = useLexeme({ id });
  return (
    <Grid container justify="center">
      {isSuccess ? (
        <>
          <Typography variant="h5">{lexeme!.lemma}</Typography>
          <Typography variant="caption">{lexeme!.pos}</Typography>
          {/* <PhrasePairTable /> */}
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
