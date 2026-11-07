import { MdLogout } from "react-icons/md";
import { Link } from "react-router-dom";
import { useAuthContext } from "../../context/AuthContext";
import toast from "react-hot-toast";

// Visible "you are signed in" indicator (avatar with green dot) + logout button
const Logout = () => {
  const { authUser, setAuthUser } = useAuthContext();

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", { credentials: "include" });
      await res.json();
      setAuthUser(null);
      toast.success("Signed out");
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <>
      <Link
        to={`/user/${authUser?.username}`}
        title={`Signed in as @${authUser?.username}`}
        className="relative shrink-0"
      >
        <img
          src={authUser?.avatarUrl}
          alt={`Signed in as ${authUser?.username}`}
          className="w-9 h-9 rounded-full border border-gray-800"
        />
        <span
          className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2"
          style={{ borderColor: "var(--bar-bg)" }}
          aria-hidden="true"
        />
      </Link>
      <button
        type="button"
        title="Sign out"
        aria-label="Sign out"
        className="nav-item bg-glass border"
        onClick={handleLogout}
      >
        <MdLogout size={22} />
      </button>
    </>
  );
};

export default Logout;
