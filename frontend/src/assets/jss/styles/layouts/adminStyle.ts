import { createStyles, Theme } from "@material-ui/core";

import {
  containerFluid,
  drawerMiniWidth,
  drawerWidth,
  transition,
} from "../../base";

const appStyle = (theme: Theme) =>
  createStyles({
    wrapper: {
      position: "relative",
      top: "0",
      // NOTE 11/08/20 psacawa: causing outer scrollbar
      // height: "100vh",
      "&:after": {
        display: "table",
        clear: "both",
        content: '" "',
      },
    },
    mainPanel: {
      transitionProperty: "top, bottom, width",
      transitionDuration: "0.2s, .2s, .35s",
      transitionTimingFunction: "linear, linear, ease",
      [theme.breakpoints.up("md")]: {
        width: `calc(100% - ${drawerWidth}px)`,
      },
      overflow: "auto",
      position: "relative",
      float: "right",
      ...transition,
      maxHeight: "100%",
      width: "100%",
      overflowScrolling: "touch",
    },
    content: {
      marginTop: "70px",
      padding: "30px 15px",
      // NOTE 13/08/20 psacawa: global width of the "main area"
      maxWidth: "1100px",
      margin: "auto",
      // NOTE 11/08/20 psacawa: this was causing double scrollbar, why was it ever here?
      // minHeight: "calc(100vh - 123px)",
      minHeight: "calc(100vh - 183px)",
    },
    container: { ...containerFluid },
    mainPanelSidebarMini: {
      [theme.breakpoints.up("md")]: {
        width: `calc(100% - ${drawerMiniWidth}px)`,
      },
    },
  });

export default appStyle;
