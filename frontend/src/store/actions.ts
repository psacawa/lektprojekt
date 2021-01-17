import { createAction } from "@reduxjs/toolkit";

import { AuthData, LoginSuccessPayload } from "../types";

export const login = createAction<AuthData>("LOGIN_SUCCESS");
export const logout = createAction("LOGOUT_SUCCESS");
