import { Redirect, useHistory, useLocation } from "react-router";
import Swal from "sweetalert2";

// This view does is just the traget of the redirection from the Stripe payment page.
// It has no function except to show an alert and make the corresponding redirect
const PaymentsView = () => {
  const location = useLocation();
  const history = useHistory();
  const params = new URLSearchParams(location.search);
  if (params.has("session_id")) {
    if (params.get("status") === "success") {
      Swal.fire({
        text: "Payment succeeded!",
        icon: "success",
        allowEscapeKey: false,
      }).then((result) => {
        history.push("/");
      });
    } else if (params.get("status") === "cancelled") {
      Swal.fire({
        icon: "info",
        text: "Payment canelled",
        allowEscapeKey: false,
      }).then((result) => {
        history.push("/pricing");
      });
    }
  } else {
    return <Redirect to="/" />;
  }
  return <></>;
};

export default PaymentsView;
