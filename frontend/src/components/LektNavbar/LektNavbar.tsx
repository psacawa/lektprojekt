import { AppBar, Hidden, IconButton, Toolbar } from "@material-ui/core";
import { Menu } from "@material-ui/icons";
import React, { Component } from "react";

interface Props {
  handleSidebarToggle: () => void;
}

const LektNavbar = ({ handleSidebarToggle }: Props) => {
  return (
    <AppBar position="static">
      <Toolbar>
        {/* TODO 10/03/20 psacawa: flesh out navbar */}
        {/* navbar on small screens  */}
        <Hidden mdUp implementation="css">
          <IconButton onClick={handleSidebarToggle}>
            <Menu />
          </IconButton>
        </Hidden>
        {/* navbar on larger screens is more minimal */}
        <Hidden smDown implementation="css"></Hidden>
      </Toolbar>
    </AppBar>
  );
};

export default LektNavbar;
