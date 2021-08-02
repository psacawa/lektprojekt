import {
  AttachMoney,
  CreateOutlined,
  HelpOutline,
  HomeOutlined as MuiHome,
  InsertEmoticon,
  LockOpen,
  PanTool,
  PersonOutline,
  Search,
  VpnKey,
} from "@material-ui/icons";
import TrackedListView from "components/TrackedListView";
import React from "react";
import AboutView from "views/AboutView";
import CreateAccountView from "views/CreateAccountView";
import HomeView from "views/HomeView";
import LandingPageView from "views/LandingPageView";
import LexemeDetailView from "views/LexemeDetailView";
import LoginView from "views/LoginView";
import LogoutView from "views/LogoutView";
import PaymentsView from "views/PaymentsView";
import PhrasePairDetailView from "views/PhrasePairDetailView";
import PhrasePairListView from "views/PhrasePairListView";
import { ListPracticeView, PracticeView } from "views/PracticeView";
import PricingView from "views/PricingView";
import ProfileView from "views/ProfileView";
import ResetPasswordView from "views/ResetPasswordView";

interface BaseRoute {
  path: string;
  name: string;
  exact: boolean;
  component: React.ComponentType<any>;
  icon?: React.ComponentType<any>;
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

// NOTE 26/07/20 psacawa: rememinder: these routes must not collide with  those of the api
// backend, at least until we aren't proxying frontend => backend in development

// TODO 05/03/20 psacawa: there are several binary attributes here, which vary independently:
// whether the route is displayed for (un)authed users, whether it should be in the drawer, etc
// figure out a robust policy for this

const baseDrawerRoutes: AppRoute[] = [
  {
    path: "/",
    name: "Home",
    exact: true,
    component: HomeView,
    icon: MuiHome,
  },
  {
    path: "/search/",
    name: "Search Phrases",
    exact: false,
    component: PhrasePairListView,
    icon: Search,
  },
  {
    path: "/profile/",
    name: "Profile",
    exact: false,
    component: ProfileView,
    icon: PersonOutline,
  },
  {
    path: "/practice/",
    name: "Practice",
    exact: false,
    component: PracticeView,
    icon: InsertEmoticon,
  },
  {
    path: "/about/",
    name: "About",
    exact: false,
    // component: AboutView,
    component: LandingPageView,
    icon: HelpOutline,
  },
];

const baseRoutes: AppRoute[] = [
  {
    path: "/pricing/",
    name: "Pricing",
    exact: false,
    component: PricingView,
    icon: AttachMoney,
  },
  {
    path: "/payments/",
    name: "Payments",
    exact: false,
    component: PaymentsView,
    icon: AttachMoney,
  },
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
    component: ListPracticeView,
  },
  {
    path: "/reset-password",
    name: "Reset Password",
    exact: false,
    component: ResetPasswordView,
    icon: VpnKey,
  },
];

const loggedInRoutes: AppRoute[] = [
  {
    path: "/logout/",
    name: "Logout",
    exact: false,
    component: LogoutView,
    icon: PanTool,
  },
];

const loggedOutRoutes: AppRoute[] = [
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
    icon: CreateOutlined,
  },
];

const routes: AppRoute[] = [
  ...baseDrawerRoutes,
  ...baseRoutes,
  ...loggedInRoutes,
  ...loggedOutRoutes,
];

export {
  baseDrawerRoutes,
  baseRoutes,
  loggedInRoutes,
  loggedOutRoutes,
  routes,
};
