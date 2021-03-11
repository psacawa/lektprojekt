import {
  Create,
  Home as MuiHome,
  InsertEmoticon,
  LockOpen,
  PanTool,
  Person,
  Search,
  VpnKey,
} from "@material-ui/icons";
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

export interface BaseRoute {
  path: string;
  name: string;
  exact: boolean;
  component: React.FunctionComponent<any>;
  icon?: React.FunctionComponent<any>;
  redirect?: boolean;
  mini?: any;
}

// the following attributes add typing to mdr-pro's collapsible views support
interface CollapsibleRoute extends BaseRoute {
  views: CollapsibleRoute[];
  collapse: boolean;
  state: string;
}

export type AppRoute = BaseRoute | CollapsibleRoute;

export // TODO 05/03/20 psacawa: there are several binary attributes here, which vary independently:
// whether the route is displayed for (un)authed users, whether it should be in the drawer, etc
// figure out a robust policy for this

const drawerRoutes: AppRoute[] = [
  {
    path: "/",
    name: "Home",
    exact: true,
    component: Home,
    icon: MuiHome,
  },
  {
    path: "/search/",
    name: "Search Phrases",
    exact: false,
    component: PhrasePairListView,
    icon: Search,
  },
];

export const baseRoutes: AppRoute[] = [
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
    icon: InsertEmoticon,
  },
  {
    path: "/reset-password",
    name: "Reset Password",
    exact: false,
    component: ResetPasswordView,
    icon: VpnKey,
  },
];

export const loggedInRoutes: AppRoute[] = [
  {
    path: "/profile/",
    name: "Profile",
    exact: false,
    component: ProfileView,
    icon: Person,
  },
  {
    path: "/logout/",
    name: "Logout",
    exact: false,
    component: LogoutView,
    icon: PanTool,
  },
];

export const loggedOutRoutes: AppRoute[] = [
  {
    path: "/login/",
    name: "Login",
    exact: false,
    component: LoginView,
    icon: LockOpen,
  },
  {
    path: "/create-account/",
    name: "Register",
    exact: false,
    component: CreateAccountView,
    icon: Create,
  },
];

export const routes: AppRoute[] = [
  ...drawerRoutes,
  ...baseRoutes,
  ...loggedInRoutes,
  ...loggedOutRoutes,
];
