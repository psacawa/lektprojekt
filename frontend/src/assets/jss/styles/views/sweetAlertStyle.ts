import { createStyles } from "@material-ui/core";

import { grayColor } from "../../base";
import buttonStyle from "../../styles/components/buttonStyle";

const sweetAlertStyle = createStyles({
  cardTitle: {
    marginTop: "0",
    marginBottom: "3px",
    color: grayColor[2],
    fontSize: "18px",
  },
  center: {
    textAlign: "center",
  },
  right: {
    textAlign: "right",
  },
  left: {
    textAlign: "left",
  },
  ...buttonStyle,
});

export default sweetAlertStyle;
