import { useAuth } from "hooks";
import React from "react";
import { Redirect } from "react-router";

const AuthRedirect = (props: React.Props<{}>) => {
  const { user } = useAuth();
  // TODO 14/08/20 psacawa: this causes redirect  on F5 even when the user is authed.
  // Investigate
  // if (user === null) {
  //   return <Redirect to="/login" />;
  // } else {
  return <>{props.children}</>;
  // }
};

export default AuthRedirect;
