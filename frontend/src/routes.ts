import React from "react";
import Home from "./views/Home";
import GimpedView from "./views/GimpedView";

interface Route {
  path: string;
  name: string;
  component: React.FunctionComponent;
  exact: boolean;
}

export const routes: Route[] = [
  {
    path: "/",
    name: "Home",
    exact: true,
    component: Home,
  },
  {
    path: "/gimped",
    name: "Search Phrases",
    exact: false,
    component: GimpedView,
  },
];
