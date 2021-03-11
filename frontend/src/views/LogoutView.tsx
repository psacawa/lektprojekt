import axios from "axios";
import { useEffect } from "react";
import { Redirect } from "react-router";

import { useAuth } from "../hooks/auth";

const LogoutView = () => {
  const { logout } = useAuth();
  useEffect(() => {
    logout.mutate();
  });
  return <Redirect to="/" />;
};

export default LogoutView;
