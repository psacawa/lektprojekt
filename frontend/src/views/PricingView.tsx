import { CircularProgress } from "@material-ui/core";
import { FormGroup } from "@material-ui/core";
import AppBar from "@material-ui/core/AppBar";
import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import CardHeader from "@material-ui/core/CardHeader";
import Container from "@material-ui/core/Container";
import CssBaseline from "@material-ui/core/CssBaseline";
import Grid from "@material-ui/core/Grid";
import { makeStyles } from "@material-ui/core/styles";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import StarIcon from "@material-ui/icons/StarBorder";
import { useAuth, usePrices } from "hooks";
import React from "react";
import { useHistory } from "react-router";
import { Link as RouterLink, useLocation } from "react-router-dom";
import { Price } from "types";

import { pricingPlans } from "../constants";

const useStyles = makeStyles((theme) => ({
  "@global": {
    ul: {
      margin: 0,
      padding: 0,
      listStyle: "none",
    },
  },
  appBar: {
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  toolbar: {
    flexWrap: "wrap",
  },
  toolbarTitle: {
    flexGrow: 1,
  },
  link: {
    margin: theme.spacing(1, 1.5),
  },
  heroContent: {
    padding: theme.spacing(8, 0, 6),
  },
  cardHeader: {
    backgroundColor:
      theme.palette.type === "light"
        ? theme.palette.grey[200]
        : theme.palette.grey[700],
  },
  cardPricing: {
    display: "flex",
    justifyContent: "center",
    alignItems: "baseline",
    marginBottom: theme.spacing(2),
  },
  footer: {
    borderTop: `1px solid ${theme.palette.divider}`,
    marginTop: theme.spacing(8),
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3),
    [theme.breakpoints.up("sm")]: {
      paddingTop: theme.spacing(6),
      paddingBottom: theme.spacing(6),
    },
  },
}));

const PricingView = () => {
  const classes = useStyles();
  const auth = useAuth();
  const location = useLocation();
  const history = useHistory();
  return (
    <>
      <Container maxWidth="sm" component="main" className={classes.heroContent}>
        <Typography
          component="h1"
          variant="h2"
          align="center"
          color="textPrimary"
          gutterBottom
        >
          Pricing
        </Typography>
      </Container>
      <Container maxWidth="md" component="main">
        <Grid container spacing={5} alignItems="flex-end">
          <>
            {pricingPlans.map((plan, idx) => (
              // Enterprise card is full width at sm breakpoint
              <Grid item key={idx} xs={12} sm={6} md={4}>
                <Card>
                  <CardHeader
                    title={plan.name}
                    subheader={plan.description}
                    titleTypographyProps={{ align: "center" }}
                    subheaderTypographyProps={{ align: "center" }}
                    action={plan.name === "Pro" ? <StarIcon /> : null}
                    className={classes.cardHeader}
                  />
                  <CardContent>
                    <div className={classes.cardPricing}>
                      <Typography
                        component="h2"
                        variant="h3"
                        color="textPrimary"
                      >
                        {plan.price}
                      </Typography>
                      <Typography
                        variant="h6"
                        color="textSecondary"
                      ></Typography>
                    </div>
                    <ul>
                      {plan.description.map((line, idx) => (
                        <Typography
                          component="li"
                          variant="subtitle1"
                          align="center"
                          key={idx}
                        >
                          {line}
                        </Typography>
                      ))}
                    </ul>
                  </CardContent>
                  <CardActions>
                    {plan.name === "Free" || !auth.user ? (
                      <Button fullWidth component={RouterLink} to="/login">
                        Log In
                      </Button>
                    ) : (
                      <form
                        action="/stripe/create-checkout-session/"
                        method="post"
                        accept-charset="utf-8"
                      >
                        <input
                          // style={{ display: "none" }}
                          type="hidden"
                          value={plan.priceId!}
                          name="price_id"
                          id="price_id"
                        />
                        <Button
                          // style={{ margin: "0 auto" }}
                          fullWidth
                          type="submit"
                          color="primary"
                        >
                          Order Now!
                        </Button>
                      </form>
                    )}
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </>
        </Grid>
      </Container>
    </>
  );
};

export default PricingView;
