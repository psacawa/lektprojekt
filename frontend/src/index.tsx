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

Sentry.init({
  dsn: process.env.REACT_APP_SENTRY_DSN,
  integrations: [new Integrations.BrowserTracing()],

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: (process.env.NODE_ENV == "development" && 1.0) || 0.2,
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

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
