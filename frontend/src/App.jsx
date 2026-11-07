import { Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import HomePage from "./pages/HomePage";
import ExplorePage from "./pages/ExplorePage";
import LikesPage from "./pages/LikesPage";
import RepoPage from "./pages/RepoPage";
import ComparePage from "./pages/ComparePage";
import LeaderboardPage from "./pages/LeaderboardPage";
import BookmarksPage from "./pages/BookmarksPage";
import Sidebar from "./components/Sidebar";
import {Toaster} from "react-hot-toast";
import { useAuthContext } from "../context/AuthContext";
import { useAuthNotice } from "./hooks/useAuthNotice";

function App() {
  const {authUser, loading} = useAuthContext();
  useAuthNotice();

  if(loading){
    return null;
  }

  return (
    <>
      <div className="flex">
        <Sidebar />
        {/* pb-20: keeps content clear of the bottom bar on phones */}
        <div className="max-w-5xl my-5 mx-auto transition-all duration-300 flex-1 min-w-0 pb-20 sm:pb-0">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/user/:username" element={<HomePage />} />
            <Route path="/repo/:owner/:name" element={<RepoPage />} />
            <Route path="/compare" element={<ComparePage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route
              path="/login"
              element={!authUser ? <LoginPage /> : <Navigate to={"/"} />}
            />
            <Route
              path="/signup"
              element={!authUser ? <SignUpPage /> : <Navigate to={"/"} />}
            />
            <Route
              path="/explore"
              element={authUser ? <ExplorePage /> : <Navigate to={"/login"} />}
            />
            <Route
              path="/likes"
              element={authUser ? <LikesPage /> : <Navigate to={"/login"} />}
            />
            <Route
              path="/bookmarks"
              element={authUser ? <BookmarksPage /> : <Navigate to={"/login"} />}
            />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
          <Toaster
            toastOptions={{
              style: {
                background: "var(--tooltip-bg)",
                color: "var(--fg)",
                border: "1px solid var(--border)",
              },
            }}
          />
        </div>
      </div>
    </>
  );
}

export default App;
