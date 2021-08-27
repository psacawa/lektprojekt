import { Grid, makeStyles, Typography } from "@material-ui/core";
import Avatar from "components/Avatar";
import { Card, CardBody, CardHeader } from "components/Card";
import { Button } from "components/CustomButtons";
import { useAuth } from "hooks";
import { Redirect, useHistory, useLocation } from "react-router-dom";
import { getLogger } from "utils";

const logger = getLogger(__filebasename);

const useStyles = makeStyles({
  cardCategoryWhite: {
    color: "rgba(255,255,255,.62)",
    margin: "0",
    fontSize: "14px",
    marginTop: "0",
    marginBottom: "0",
  },
  cardTitleWhite: {
    color: "#FFFFFF",
    marginTop: "0px",
    minHeight: "auto",
    fontWeight: 300,
    fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
    marginBottom: "3px",
    textDecoration: "none",
  },
  content: {
    margin: "auto",
    padding: "20px",
  },
  item: {
    margin: "20px",
  },
  field: {
    margin: "10px",
  },
  faint: {
    fontWeight: "lighter",
    marginRight: "5px",
  },
});

const ProfileView = () => {
  const classes = useStyles();
  const history = useHistory();
  const location = useLocation();
  const { user } = useAuth();
  logger("user=", user);
  if (!user) {
    return <Redirect to={`/login/?next=${location.pathname}`} />;
  }
  return (
    <Grid container justifyContent="center" wrap="nowrap">
      <Card>
        <CardHeader color="primary">
          <h4 className={classes.cardTitleWhite}>Profile</h4>
          <p className={classes.cardCategoryWhite}>Complete your profile</p>
        </CardHeader>
        <CardBody className={classes.content}>
          <Grid
            container
            justifyContent="center"
            wrap="nowrap"
            className={classes.content}
          >
            <Grid item className={classes.item} xs={12} sm={6}>
              <Avatar className="" />
            </Grid>
            <Grid item className={classes.item} xs={12} sm={6}>
              <h3 className={classes.field}>{user.username}</h3>
              <div>
                <Typography className={classes.field} variant="body1">
                  <span className={classes.faint}>Email:</span> {user.email}
                </Typography>
                <div>
                  <Typography className={classes.field} variant="body1">
                    <span className={classes.faint}>Plan:</span> {user.level}
                  </Typography>
                  {user.level === "plus" ? (
                    <Button
                      component="a"
                      // TODO 21/08/20 psacawa: finish this
                      href={`http://localhost:8000/stripe/portal/`}
                    >
                      Manage your subscription with stripe
                    </Button>
                  ) : (
                    <Button
                      onClick={(ev: React.MouseEvent<{}>) => {
                        history.push("/pricing/");
                      }}
                    >
                      Order Now!
                    </Button>
                  )}
                </div>
              </div>
            </Grid>
          </Grid>
        </CardBody>
      </Card>
    </Grid>
  );
};

export default ProfileView;
