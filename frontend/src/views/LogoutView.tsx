import axios from "axios";
import { useDispatch } from "react-redux";
import { Redirect } from "react-router";

import { useLogout } from "../clientHooks";
import { logout } from "../store/actions";
import { useLoggedIn } from "../store/selectors";

const LogoutView = () => {
  const loggedIn = useLoggedIn();
  const logoutMutation = useLogout();
  const dispatch = useDispatch();
  if (loggedIn) {
    logoutMutation.mutate();
    delete axios.defaults.headers["Authorization"];
    dispatch(logout());
  }
  return <Redirect to="/" />;
};

export default LogoutView;
