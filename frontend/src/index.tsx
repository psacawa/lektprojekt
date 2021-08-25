import "assets/css/base.css";
import "@sweetalert2/theme-material-ui";

import * as Sentry from "@sentry/react";
import { Integrations } from "@sentry/tracing";
import { createBrowserHistory } from "history";
import { queryClient } from "hooks";
import { AuthProvider } from "hooks/auth";
import { SessionProvider } from "hooks/session";
import ReactDOM from "react-dom";
import { QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import { Router } from "react-router-dom";
import { getLogger, setupInfo } from "utils";

import App from "./App";
// import reportWebVitals from "./reportWebVitals";

// show all `debug` debuggers in browser console
localStorage.debug = "*";
const logger = getLogger(__filebasename);

const history = createBrowserHistory();

// in development trace everything, in production, read from var, fallback to 0.2
if (process.env.REACT_SENTRY_ENV !== "none")
  Sentry.init({
    dsn: process.env.REACT_SENTRY_DSN,
    integrations: [new Integrations.BrowserTracing()],
    tracesSampleRate:
      process.env.NODE_ENV === "development"
        ? 0.5
        : parseInt(process.env.REACT_SENTRY_SAMPLING_RATE) || 0.2,
    environment: process.env.NODE_ENV,
  });

setupInfo();

ReactDOM.render(
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <SessionProvider>
        <Router history={history}>
          <App />
        </Router>
      </SessionProvider>
    </AuthProvider>
    <ReactQueryDevtools />
  </QueryClientProvider>,
  document.getElementById("root")
);

logger("App loaded");

// reportWebVitals();
