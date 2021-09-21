import { Grid } from "@material-ui/core";
import { CircularProgress, Typography } from "@material-ui/core";
import { useLexeme } from "hooks";
import { useParams } from "react-router";

const LexemeDetailView = () => {
  const { id } = useParams<any>();
  const { isSuccess, data: lexeme } = useLexeme({ id });
  return (
    <Grid container justifyContent="center" spacing={2}>
      {isSuccess ? (
        <>
          <Grid item>
            <Typography variant="h5">{lexeme!.lemma}</Typography>
          </Grid>
          <Grid item>
            <Typography variant="caption">{lexeme!.pos}</Typography>
          </Grid>
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
