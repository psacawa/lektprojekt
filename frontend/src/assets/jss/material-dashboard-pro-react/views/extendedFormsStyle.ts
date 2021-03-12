import {
  blackColor,
  cardTitle,
  hexToRgb,
} from "../../material-dashboard-pro-react";
import customCheckboxRadioSwitch from "../../material-dashboard-pro-react/customCheckboxRadioSwitch";
import customSelectStyle from "../../material-dashboard-pro-react/customSelectStyle";

const extendedFormsStyle = {
  ...customCheckboxRadioSwitch,
  ...customSelectStyle,
  cardTitle,
  cardIconTitle: {
    ...cardTitle,
    marginTop: "15px",
    marginBottom: "0px",
  },
  label: {
    cursor: "pointer",
    paddingLeft: "0",
    color: "rgba(" + hexToRgb(blackColor) + ", 0.26)",
    fontSize: "14px",
    lineHeight: "1.428571429",
    fontWeight: 400,
    display: "inline-flex",
  },
  mrAuto: {
    marginRight: "auto",
  },
  mlAuto: {
    marginLeft: "auto",
  },
};

export default extendedFormsStyle;
