import { combineReducers, createReducer } from "@reduxjs/toolkit";

import { UserState } from "../types";
import { login, logout } from "./actions";

export const authReducer = createReducer<UserState>(
  { loggedIn: false },
  (builder) =>
    builder
      .addCase(login, (state, action) => ({
        loggedIn: true,
        key: action.payload.key,
      }))
      .addCase(logout, (state, action) => ({ loggedIn: false }))
);

const rootReducer = combineReducers({
  auth: authReducer,
});

export default rootReducer;
