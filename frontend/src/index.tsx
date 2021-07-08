import "assets/css/base.css";

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
