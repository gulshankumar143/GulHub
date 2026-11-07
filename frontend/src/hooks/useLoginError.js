import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";

// The backend redirects to /login?error=... when GitHub login fails.
// Show that message once and clean the URL.
export function useLoginError() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const error = params.get("error");

  useEffect(() => {
    if (!error) return;
    toast.error(error, { duration: 7000, id: "login-error" });
    navigate("/login", { replace: true });
  }, [error, navigate]);
}
