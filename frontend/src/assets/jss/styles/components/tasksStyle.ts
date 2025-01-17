import customCheckboxRadioSwitch from "assets/jss/styles/customCheckboxRadioSwitch";

import {
  dangerColor,
  defaultFont,
  grayColor,
  primaryColor,
  tooltip,
} from "../../base";

const tasksStyle = {
  ...customCheckboxRadioSwitch,
  table: {
    marginBottom: "0",
  },
  tableRow: {
    position: "relative",
    borderBottom: "1px solid " + grayColor[5],
  },
  tableActions: {
    border: "none",
    padding: "12px 8px !important",
    verticalAlign: "middle",
  },
  tableCell: {
    ...defaultFont,
    padding: "0",
    verticalAlign: "middle",
    border: "none",
    lineHeight: "1.42857143",
    fontSize: "14px",
  },
  tableActionButton: {
    width: "27px",
    height: "27px",
    padding: "0",
  },
  tableActionButtonIcon: {
    width: "17px",
    height: "17px",
  },
  edit: {
    backgroundColor: "transparent",
    color: primaryColor[0],
    boxShadow: "none",
  },
  close: {
    backgroundColor: "transparent",
    color: dangerColor[0],
    boxShadow: "none",
  },
  tooltip,
};
export default tasksStyle;
