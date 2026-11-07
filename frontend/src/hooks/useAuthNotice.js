import { useEffect } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuthContext } from "../../context/AuthContext";

// After GitHub login the backend redirects to /?login=success.
// Confirm the sign-in with a toast, or explain if the browser did not keep the session.
export function useAuthNotice() {
  const { authUser, loading } = useAuthContext();
  const [params] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const status = params.get("login");

  useEffect(() => {
    if (loading || !status) return;

    if (status === "success") {
      if (authUser) {
        toast.success(`Signed in as @${authUser.username}`, { id: "login-status" });
      } else {
        toast.error(
          "GitHub login finished, but your browser did not keep the session. " +
            "Clear cookies for localhost (or try a private window) and log in again.",
          { id: "login-status", duration: 10000 }
        );
      }
    }

    navigate(location.pathname, { replace: true }); // drop ?login=... from the URL
  }, [loading, status, authUser, navigate, location.pathname]);
}
