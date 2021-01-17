import { createBrowserHistory } from "history";
import React from "react";
import ReactDOM from "react-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import { Provider } from "react-redux";
import { Router } from "react-router-dom";

import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { store } from "./store";

const history = createBrowserHistory();
const queryClient = new QueryClient();

ReactDOM.render(
  <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <Router history={history}>
        <App />
      </Router>
      <ReactQueryDevtools initialIsOpen />
    </QueryClientProvider>
  </Provider>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
