import { Grid, makeStyles, Typography } from "@material-ui/core";

const useStyles = makeStyles(() => ({
  content: { maxWidth: 700, marginBottom: 20, marginTop: 20 },
}));

const PolicyView = () => {
  const classes = useStyles();
  return (
    <Grid container justifyContent="center">
      <Grid item>
        <Typography id="tos" variant="h4">
          Terms of Service
        </Typography>
        <Typography className={classes.content} variant="body1">
          Use the service, have fun, don't be abusive.
        </Typography>
        <Typography id="policy" variant="h4">
          Privacy Policy
        </Typography>

        <Typography className={classes.content} variant="body1">
          LexQuest doesn't use your data in any way except for transactional
          emails and billing with Stripe (credit card processor).
        </Typography>
        <Typography variant="body2">- Paweł Sacawa</Typography>
      </Grid>
    </Grid>
  );
};

export default PolicyView;
