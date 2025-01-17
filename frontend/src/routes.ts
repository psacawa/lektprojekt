import {
  AttachMoney,
  CreateOutlined,
  Error as MUIError,
  HelpOutline,
  HomeOutlined as MuiHome,
  InsertEmoticon,
  LockOpen,
  PanTool,
  PersonOutline,
  Search,
  VpnKey,
} from "@material-ui/icons";
import React from "react";
import AboutView from "views/AboutView";
import CoursesView from "views/CoursesView";
import CreateAccountView from "views/CreateAccountView";
import FallbackView from "views/FallbackView";
import FeatureDetailView from "views/FeatureDetailView";
import HomeView from "views/HomeView";
import LandingPageView from "views/LandingPageView";
import LexemeDetailView from "views/LexemeDetailView";
import LoginView from "views/LoginView";
import LogoutView from "views/LogoutView";
import PaymentsView from "views/PaymentsView";
import PhrasePairDetailView from "views/PhrasePairDetailView";
import PhrasePairListView from "views/PhrasePairListView";
import PolicyView from "views/PolicyView";
import { ListPracticeView, PracticeView } from "views/PracticeView";
import PricingView from "views/PricingView";
import ProfileView from "views/ProfileView";
import ResetPasswordView from "views/ResetPasswordView";
import ScratchpadView from "views/ScratchpadView";
import TrackedListView from "views/TrackedListView";

interface BaseRoute {
  path: string;
  name: string;
  exact: boolean;
  component: React.ComponentType<any>;
  icon?: React.ComponentType<any>;
  redirect?: boolean;
  mini?: any;
  inDrawer?: boolean;
  login?: "required" | "disallowed";
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
    inDrawer: true,
  },
  {
    path: "/search/",
    name: "Search Phrases",
    exact: false,
    component: PhrasePairListView,
    icon: Search,
    inDrawer: true,
  },
  {
    path: "/courses/",
    name: "My Lists",
    exact: false,
    component: CoursesView,
    icon: PersonOutline,
    inDrawer: true,
  },
  {
    path: "/practice/",
    name: "Practice",
    exact: false,
    component: PracticeView,
    icon: InsertEmoticon,
    inDrawer: true,
  },
  {
    path: "/profile/",
    name: "Profile",
    exact: false,
    component: ProfileView,
    icon: PersonOutline,
    inDrawer: true,
    login: "required",
  },
  {
    path: "/about/",
    name: "About",
    exact: false,
    // component: AboutView,
    component: AboutView,
    icon: HelpOutline,
    inDrawer: true,
  },
  {
    path: "/logout/",
    name: "Logout",
    exact: false,
    component: LogoutView,
    icon: PanTool,
    inDrawer: true,
    login: "required",
  },
  // login disallowed
  {
    path: "/login/",
    name: "Login",
    exact: false,
    component: LoginView,
    icon: LockOpen,
    inDrawer: true,
    login: "disallowed",
  },
  {
    path: "/create-account/",
    name: "Register",
    exact: false,
    component: CreateAccountView,
    icon: CreateOutlined,
    inDrawer: true,
    login: "disallowed",
  },
];

// NOTE 19/08/20 psacawa: as these routes are not displayed in the drawer, the icons can
// be removed once the direction is clearer
let baseRoutes: AppRoute[] = [
  {
    path: "/pricing/",
    name: "Pricing",
    exact: false,
    component: PricingView,
    icon: AttachMoney,
  },
  {
    path: "/policies/",
    name: "Policies",
    exact: false,
    component: PolicyView,
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
    path: "/features/:id/",
    name: "Feature Detail View",
    exact: false,
    component: FeatureDetailView,
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
    path: "/reset-password/",
    name: "Reset Password",
    exact: false,
    component: ResetPasswordView,
    icon: VpnKey,
  },
  // {
  //   path: "/",
  //   name: "404",
  //   exact: false,
  //   component: FallbackView,
  //   icon: MUIError,
  // },
];

if (process.env.NODE_ENV === "development") {
  baseRoutes = baseRoutes.concat([
    {
      path: "/throw-error",
      name: "Fubar",
      exact: true,
      component: () => {
        console.error("error");
        throw new Error("Manually thrown error");
      },

      icon: MUIError,
    },
    {
      path: "/scratch",
      name: "Scratchpad",
      exact: true,
      component: ScratchpadView,
      icon: MUIError,
    },
  ]);
}

const loggedInRoutes: AppRoute[] = baseDrawerRoutes.filter(
  (route) => route.login === "required"
);
const loggedOutRoutes: AppRoute[] = baseDrawerRoutes.filter(
  (route) => route.login === "disallowed"
);
const routes: AppRoute[] = [...baseDrawerRoutes, ...baseRoutes];

export { baseDrawerRoutes, loggedInRoutes, loggedOutRoutes, routes };
