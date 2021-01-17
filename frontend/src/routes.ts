import { concat } from "lodash";
import React from "react";

import CreateAccountView from "./views/CreateAccountView";
import Home from "./views/Home";
import LexemeDetailView from "./views/LexemeDetailView";
import LoginView from "./views/LoginView";
import LogoutView from "./views/LogoutView";
import PhrasePairDetailView from "./views/PhrasePairDetailView";
import PhrasePairListView from "./views/PhrasePairListView";

export interface Route {
  path: string;
  name: string;
  exact: boolean;
  component?: React.FunctionComponent<any>;
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

export const baseRoutes: Route[] = [
  {
    path: "/pairs/:id",
    name: "PhrasePair Detail View",
    exact: false,
    component: PhrasePairDetailView,
  },
  {
    path: "/lexemes/:id",
    name: "Lexeme Detail View",
    exact: false,
    component: LexemeDetailView,
  },
];

export const loggedInRoutes: Route[] = [
  {
    path: "/logout/",
    name: "Logout",
    exact: false,
    component: LogoutView,
  },
];

export const loggedOutRoutes: Route[] = [
  {
    path: "/login",
    name: "Login",
    exact: false,
    component: LoginView,
  },
  {
    path: "/create-account",
    name: "Register",
    exact: false,
    component: CreateAccountView,
  },
];

export const routes: Route[] = [
  ...drawerRoutes,
  ...baseRoutes,
  ...loggedInRoutes,
  ...loggedOutRoutes,
];
