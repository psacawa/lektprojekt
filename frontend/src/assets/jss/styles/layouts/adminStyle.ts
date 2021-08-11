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
      height: "100vh",
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
      minHeight: "calc(100vh - 123px)",
    },
    container: { ...containerFluid },
    mainPanelSidebarMini: {
      [theme.breakpoints.up("md")]: {
        width: `calc(100% - ${drawerMiniWidth}px)`,
      },
    },
  });

export default appStyle;
