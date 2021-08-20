import { CircularProgress } from "@material-ui/core";
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
import { useAuth, useCreateCheckoutSession, usePrices } from "hooks";
import { Link as RouterLink, useLocation } from "react-router-dom";
import { FreePrice, Price } from "types";

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
  const createCheckoutSession = useCreateCheckoutSession();

  // if the query param "gyp" is passed, so the daily price option for $0.5
  // for live testing purposes
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const showDaily = params.has("gyp");
  return (
    <>
      <Container className={classes.heroContent} component="main" maxWidth="sm">
        <Typography
          align="center"
          color="textPrimary"
          component="h1"
          gutterBottom
          variant="h2"
        >
          Pricing
        </Typography>
      </Container>
      <Container component="main" maxWidth="md">
        <Grid alignItems="flex-end" container spacing={5}>
          {pricesQuery.data ? (
            <>
              {[
                freePrice,
                ...pricesQuery.data.filter(
                  (price) => price.recurring.interval !== "day" || showDaily
                ),
              ].map((price, idx) => (
                // Enterprise card is full width at sm breakpoint
                <Grid item key={idx} md={4} sm={6} xs={12}>
                  <Card>
                    <CardHeader
                      action={
                        price.product.name === "Pro" ? <StarIcon /> : null
                      }
                      className={classes.cardHeader}
                      title={price.product.name}
                      titleTypographyProps={{ align: "center" }}
                    />
                    <CardContent>
                      <div className={classes.cardPricing}>
                        <Typography
                          color="textPrimary"
                          component="h2"
                          variant="h4"
                        >
                          {isFreePrice(price)
                            ? "Free!"
                            : `$${price.unit_amount / 100}/${
                                price.recurring.interval
                              }`}
                        </Typography>
                        <Typography
                          color="textSecondary"
                          variant="h6"
                        ></Typography>
                      </div>
                      <ul>
                        {(isFreePrice(price) ? freeFeatures : paidFeatures).map(
                          (line, idx) => (
                            <Typography
                              align="center"
                              component="li"
                              key={idx}
                              variant="subtitle1"
                            >
                              {line}
                            </Typography>
                          )
                        )}
                      </ul>
                    </CardContent>
                    <CardActions>
                      {isFreePrice(price) ? (
                        <Button component={RouterLink} fullWidth to="/practice">
                          Go!
                        </Button>
                      ) : !auth.user ? (
                        <Button component={RouterLink} fullWidth to="/login">
                          Login
                        </Button>
                      ) : (
                        <Button
                          color="primary"
                          fullWidth
                          onClick={(_: React.MouseEvent<{}>) => {
                            createCheckoutSession.mutate({
                              price_id: price.id,
                            });
                          }}
                          type="submit"
                        >
                          Order Now!
                        </Button>
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
