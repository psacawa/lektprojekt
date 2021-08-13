import {
  createGenerateClassName,
  Grid,
  makeStyles,
  Typography,
} from "@material-ui/core";
import Avatar from "components/Avatar";
import { useAuth } from "hooks";
import { toSvg } from "jdenticon";
import { Redirect } from "react-router";

const useStyles = makeStyles({
  main: {
    maxWidth: "800px",
  },
});

const ProfileView = () => {
  const classes = useStyles();
  const { user } = useAuth();
  if (user === null) {
    return <Redirect to="/login" />;
  }
  return (
    <>
      <Grid container justifyContent="center" className={classes.main}>
        <Grid item xs={12} sm={6} md={4}>
          <Avatar fullSize />
        </Grid>
        <Grid item xs={12} sm>
          <Typography variant="h3">{user.username}</Typography>
        </Grid>
      </Grid>
    </>
  );
};

export default ProfileView;
