import { concat } from "lodash";
import React from "react";

import TrackedListView from "./components/TrackedListView";
import CreateAccountView from "./views/CreateAccountView";
import Home from "./views/Home";
import LexemeDetailView from "./views/LexemeDetailView";
import LoginView from "./views/LoginView";
import LogoutView from "./views/LogoutView";
import PhrasePairDetailView from "./views/PhrasePairDetailView";
import PhrasePairListView from "./views/PhrasePairListView";
import PracticeView from "./views/PracticeView";
import ProfileView from "./views/ProfileView";
import ResetPasswordView from "./views/ResetPasswordView";

export interface Route {
  path: string;
  name: string;
  exact: boolean;
  component?: React.FunctionComponent<any>;
}

// TODO 05/03/20 psacawa: there are several binary attributes here, which vary independently:
// whether the route is displayed for (un)authed users, whether it should be in the drawer, etc
// figure out a robust policy for this

export const drawerRoutes: Route[] = [
  {
    path: "/",
    name: "Home",
    exact: true,
    component: Home,
  },
  {
    path: "/search/",
    name: "Search Phrases",
    exact: false,
    component: PhrasePairListView,
  },
];

export const baseRoutes: Route[] = [
  {
    path: "/pairs/:id/",
    name: "PhrasePair Detail View",
    exact: false,
    component: PhrasePairDetailView,
  },
  {
    path: "/lexemes/:id/",
    name: "Lexeme Detail View",
    exact: false,
    component: LexemeDetailView,
  },
  {
    path: "/lists/:id",
    name: "Training List View",
    exact: true,
    component: TrackedListView,
  },
  {
    path: "/lists/:id/practice/",
    name: "Practice Mode",
    exact: false,
    component: PracticeView,
  },
  {
    path: "/reset-password",
    name: "Reset Password",
    exact: false,
    component: ResetPasswordView,
  },
];

export const loggedInRoutes: Route[] = [
  {
    path: "/profile/",
    name: "Profile",
    exact: false,
    component: ProfileView,
  },
  {
    path: "/logout/",
    name: "Logout",
    exact: false,
    component: LogoutView,
  },
];

export const loggedOutRoutes: Route[] = [
  {
    path: "/login/",
    name: "Login",
    exact: false,
    component: LoginView,
  },
  {
    path: "/create-account/",
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
