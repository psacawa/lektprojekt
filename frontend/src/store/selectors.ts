import { useSelector } from "react-redux";

import { RootState } from "../types";

export const useLoggedIn = () =>
  useSelector((state: RootState) => state.auth.loggedIn);
