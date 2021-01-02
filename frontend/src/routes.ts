import { concat } from "lodash";
import React from "react";

import Home from "./views/Home";
import PhrasePairDetailView from "./views/PhrasePairDetailView";
import PhrasePairListView from "./views/PhrasePairListView";

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
    component: PhrasePairListView,
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
