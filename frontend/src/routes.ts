import React from "react";
import Home from "./views/Home";
import GimpedView from "./views/GimpedView";
import { concat } from "lodash";
import PhrasePairDetailView from "./views/PhrasePairDetailView";

interface Route {
  path: string;
  name: string;
  exact: boolean;
  component: React.FunctionComponent<any>;
}

export const drawerRoutes: Route[] = [
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

export const routes: Route[] = concat(drawerRoutes, [
  {
    path: "/pairs/:pk",
    name: "PhrasePair Detail View",
    exact: false,
    component: PhrasePairDetailView as any,
  },
]);
