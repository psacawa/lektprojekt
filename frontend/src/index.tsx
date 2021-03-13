import "assets/scss/base.scss?v=1.9.0";

import { createBrowserHistory } from "history";
import React from "react";
import ReactDOM from "react-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import { Router } from "react-router-dom";

import App from "./App";
import { AuthProvider } from "./hooks/auth";
import reportWebVitals from "./reportWebVitals";

const history = createBrowserHistory();
const queryClient = new QueryClient();

ReactDOM.render(
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <Router history={history}>
        <App />
      </Router>
    </AuthProvider>
    <ReactQueryDevtools />
  </QueryClientProvider>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
