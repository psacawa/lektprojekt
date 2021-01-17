import { configureStore, getDefaultMiddleware } from "@reduxjs/toolkit";
import { createStore } from "redux";
import { createLogger } from "redux-logger";

import rootReducer from "./reducers";

const logger = createLogger();
export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(logger),
});
