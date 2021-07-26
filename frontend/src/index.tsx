import "assets/css/base.css";

import * as Sentry from "@sentry/react";
import { Integrations } from "@sentry/tracing";
import { createBrowserHistory } from "history";
import { AuthProvider } from "hooks/auth";
import { SessionProvider } from "hooks/session";
import React from "react";
import ReactDOM from "react-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import { Router } from "react-router-dom";

import App from "./App";
import reportWebVitals from "./reportWebVitals";

const history = createBrowserHistory();
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      // TODO 21/03/20 psacawa: investigate whether this can be safely added
      refetchOnMount: false,
    },
  },
});

// in development trace everything, in production, read from var, fallback to 0.2
Sentry.init({
  dsn: process.env.REACT_SENTRY_DSN,
  integrations: [new Integrations.BrowserTracing()],
  tracesSampleRate:
    process.env.NODE_ENV == "development"
      ? 1.0
      : parseInt(process.env.REACT_SENTRY_SAMPLING_RATE) || 0.2,
  environment: process.env.NODE_ENV,
});

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

reportWebVitals();
