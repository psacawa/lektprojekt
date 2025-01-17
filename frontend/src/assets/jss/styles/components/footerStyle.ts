import { createStyles } from "@material-ui/core";

import {
  container,
  containerFluid,
  defaultFont,
  grayColor,
  primaryColor,
  whiteColor,
} from "../../base";

const footerStyle = createStyles({
  block: {},
  left: {
    float: "left!important" as any,
    display: "block",
  },
  right: {
    margin: "0",
    fontSize: "14px",
    float: "right!important" as any,
    padding: "15px",
  },
  footer: {
    bottom: "0",
    borderTop: "1px solid " + grayColor[15],
    padding: "15px 0",
    ...defaultFont,
    zIndex: 4,
  },
  container: {
    zIndex: 3,
    ...container,
    position: "relative",
  },
  containerFluid: {
    zIndex: 3,
    ...containerFluid,
    position: "relative",
  },
  a: {
    color: primaryColor[0],
    textDecoration: "none",
    backgroundColor: "transparent",
  },
  list: {
    marginBottom: "0",
    padding: "0",
    marginTop: "0",
  },
  inlineBlock: {
    display: "inline-block",
    padding: "0",
    paddingRight: "5px",
    width: "auto",
  },
  whiteColor: {
    "&,&:hover,&:focus": {
      color: whiteColor,
    },
  },
});
export default footerStyle;
