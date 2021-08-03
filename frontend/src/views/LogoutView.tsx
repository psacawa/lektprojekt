import { useAuth } from "hooks/auth";
import { useEffect } from "react";
import { Redirect } from "react-router";

const LogoutView = () => {
  const { logout } = useAuth();
  useEffect(() => {
    logout.mutate();
  });
  return <Redirect to="/" />;
};

export default LogoutView;
