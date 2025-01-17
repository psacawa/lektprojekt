import { CircularProgress, Grid, Typography } from "@material-ui/core";
import { useFeature } from "hooks";
import { useParams } from "react-router";

const LexemeDetailView = () => {
  const { id } = useParams<any>();
  const { isSuccess, data: feature } = useFeature({ id });
  return (
    <Grid container justifyContent="center">
      {isSuccess ? (
        <Typography variant="h5">{feature?.description}</Typography>
      ) : (
        <Grid item>
          <CircularProgress style={{ margin: "auto" }} />
        </Grid>
      )}
    </Grid>
  );
};

export default LexemeDetailView;
