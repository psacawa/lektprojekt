import { CircularProgress, CssBaseline } from "@material-ui/core";
import Button from "@material-ui/core/Button";
import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import CardHeader from "@material-ui/core/CardHeader";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import StarIcon from "@material-ui/icons/StarBorder";
import { useAuth, usePrices } from "hooks";
import { useHistory } from "react-router";
import { Link as RouterLink, useLocation } from "react-router-dom";

import { origin } from "../constants";
import { FreePrice, Price } from "../types";

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

const freeFeatures: string[] = ["3 lists"];
const paidFeatures: string[] = ["Unlimited lists"];

const freePrice: FreePrice = {
  id: null,
  currency: "usd",
  product: {
    name: "LexQuest Basic",
  },
  unit_amount: 0,
};

const isFreePrice = (price: Price | FreePrice): price is FreePrice => {
  return price.id === null;
};

const PricingView = () => {
  const classes = useStyles();
  const auth = useAuth();
  const pricesQuery = usePrices();

  // if the query param "gyp" is passed, so the daily price option for $0.5
  // for live testing purposes
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const showDaily = params.has("gyp");
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
          {pricesQuery.data ? (
            <>
              {[
                freePrice,
                ...pricesQuery.data.filter(
                  (price) => price.recurring.interval !== "day" || showDaily
                ),
              ].map((price, idx) => (
                // Enterprise card is full width at sm breakpoint
                <Grid item key={idx} xs={12} sm={6} md={4}>
                  <Card>
                    <CardHeader
                      title={price.product.name}
                      titleTypographyProps={{ align: "center" }}
                      action={
                        price.product.name === "Pro" ? <StarIcon /> : null
                      }
                      className={classes.cardHeader}
                    />
                    <CardContent>
                      <div className={classes.cardPricing}>
                        <Typography
                          component="h2"
                          variant="h4"
                          color="textPrimary"
                        >
                          {isFreePrice(price)
                            ? "Free!"
                            : `\$${price.unit_amount / 100}/${
                                price.recurring.interval
                              }`}
                        </Typography>
                        <Typography
                          variant="h6"
                          color="textSecondary"
                        ></Typography>
                      </div>
                      <ul>
                        {(isFreePrice(price) ? freeFeatures : paidFeatures).map(
                          (line, idx) => (
                            <Typography
                              component="li"
                              variant="subtitle1"
                              align="center"
                              key={idx}
                            >
                              {line}
                            </Typography>
                          )
                        )}
                      </ul>
                    </CardContent>
                    <CardActions>
                      {isFreePrice(price) ? (
                        <Button fullWidth component={RouterLink} to="/practice">
                          Go!
                        </Button>
                      ) : !auth.user ? (
                        <Button fullWidth component={RouterLink} to="/login">
                          Login
                        </Button>
                      ) : (
                        <form
                          action={`${origin}stripe/create-checkout-session/`}
                          method="post"
                          accept-charset="utf-8"
                        >
                          <input
                            type="hidden"
                            value={price.id}
                            name="price_id"
                            id="price_id"
                          />
                          <Button fullWidth type="submit" color="primary">
                            Order Now!
                          </Button>
                        </form>
                      )}
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </>
          ) : (
            <CircularProgress />
          )}
        </Grid>
      </Container>
    </>
  );
};

export default PricingView;
