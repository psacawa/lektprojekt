import { replace } from "lodash";

export const drawerWidth = 260;
// Cross-origin requests on localhost don't work... a security feature of browsers perhaps?
export const apiOrigin =
  process.env.NODE_ENV !== "production"
    ? `http://localhost:8000/`
    : window.location.hostname.includes(process.env.REACT_DOMAIN)
    ? window.location.origin.replace("wwww.", "api.")
    : null;

export const apiRoot = `${apiOrigin}api/`;
export const authRoot = `${apiOrigin}auth/`;
export const paymentRoot = `${apiOrigin}stripe/`;
export const HOUR = 60 * 60 * 1000;

// needs to be updated manually
export const pricingPlans = [
  {
    name: "Free",
    price: "0",
    description: ["100 conversations per month"],
    buttonText: "Sign up for free",
    buttonVariant: "outlined",
    priceId: null,
  },
  {
    name: "Test",
    price: "$0.5/mo",
    description: ["100 conversations per month"],
    buttonText: "Get started",
    buttonVariant: "contained",
    priceId: "price_1JFM3iHSwS5HmDGtjiJIQo8q",
  },
  {
    name: "Premium",
    price: "$10/mo",
    description: ["100 conversations per month"],
    buttonText: "Get started",
    buttonVariant: "contained",
    priceId: "price_1JFU8gHSwS5HmDGt6NhnkILh",
  },
];
