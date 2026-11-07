import { NavLink } from "react-router-dom";
import { IoHomeSharp } from "react-icons/io5";
import { FaBookmark, FaHeart, FaMoon, FaSun, FaTrophy } from "react-icons/fa";
import { MdCompareArrows, MdEditDocument, MdOutlineExplore } from "react-icons/md";
import { PiSignInBold } from "react-icons/pi";
import Logout from "./Logout";
import { useAuthContext } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

const NavItem = ({ to, title, end, children }) => (
  <NavLink
    to={to}
    end={end}
    title={title}
    aria-label={title}
    className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
  >
    {children}
  </NavLink>
);

const Sidebar = () => {
  const { authUser } = useAuthContext();
  const { theme, toggleTheme } = useTheme();

  return (
    <aside
      className="fixed bottom-0 inset-x-0 z-40 h-14 border-t
        sm:sticky sm:top-0 sm:inset-x-auto sm:bottom-auto sm:h-screen sm:w-16 sm:min-w-16 sm:border-t-0 sm:border-r sm:py-6
        backdrop-blur-md border-[var(--border)]"
      style={{ backgroundColor: "var(--bar-bg)" }}
    >
      {/* Bottom bar on phones, vertical rail on larger screens */}
      <nav className="h-full w-full flex flex-row sm:flex-col items-center gap-1 px-2 sm:px-0 overflow-x-auto sm:overflow-visible">
        <NavLink to="/" className="hidden sm:flex justify-center mb-2" title="GulHub">
          <img className="h-8 logo-img" src="/github.svg" alt="Github Logo" />
        </NavLink>

        <NavItem to="/" end title="Home">
          <IoHomeSharp size={20} />
        </NavItem>

        <NavItem to="/leaderboard" title="Leaderboard">
          <FaTrophy size={20} />
        </NavItem>

        <NavItem to="/compare" title="Compare users">
          <MdCompareArrows size={25} />
        </NavItem>

        {authUser && (
          <>
            <NavItem to="/explore" title="Explore">
              <MdOutlineExplore size={25} />
            </NavItem>
            <NavItem to="/likes" title="Likes">
              <FaHeart size={21} />
            </NavItem>
            <NavItem to="/bookmarks" title="Bookmarks">
              <FaBookmark size={19} />
            </NavItem>
          </>
        )}

        {!authUser && (
          <>
            <NavItem to="/login" title="Login">
              <PiSignInBold size={25} />
            </NavItem>
            <NavItem to="/signup" title="Sign up">
              <MdEditDocument size={25} />
            </NavItem>
          </>
        )}

        <div className="flex flex-row sm:flex-col items-center gap-2 ml-auto sm:ml-0 sm:mt-auto">
          <button
            type="button"
            onClick={toggleTheme}
            className="nav-item"
            title={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <FaSun size={19} /> : <FaMoon size={19} />}
          </button>

          {authUser && <Logout />}
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;
