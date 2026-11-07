import { useState } from "react";
import { Link } from "react-router-dom";
import { FaBookmark, FaRegStar } from "react-icons/fa";
import { FaCodeFork } from "react-icons/fa6";
import { FiExternalLink } from "react-icons/fi";
import toast from "react-hot-toast";
import { useAuthContext } from "../../context/AuthContext";
import { apiFetch } from "../utils/api";

// Bookmarks are kept on the logged-in user, so no extra request is needed here.
const BookmarksPage = () => {
  const { authUser, setAuthUser } = useAuthContext();
  const [busyId, setBusyId] = useState(null);
  const bookmarks = [...(authUser?.bookmarks || [])].sort(
    (a, b) => new Date(b.addedAt) - new Date(a.addedAt)
  );

  const remove = async (repoId) => {
    setBusyId(repoId);
    try {
      const data = await apiFetch(`/api/users/bookmarks/${repoId}`, { method: "DELETE" });
      setAuthUser((prev) => (prev ? { ...prev, bookmarks: data.bookmarks } : prev));
      toast.success("Bookmark removed");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="px-4">
      <h1 className="text-2xl font-bold text-center mb-4 text-gradient">Bookmarked repositories</h1>

      {bookmarks.length === 0 ? (
        <p className="text-center text-gray-500">
          Nothing saved yet. Click the bookmark icon on any repository to save it here.
        </p>
      ) : (
        <ul className="grid gap-3 max-w-3xl mx-auto">
          {bookmarks.map((b) => (
            <li key={b.repoId} className="bg-glass rounded-lg p-4 flex flex-col gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  to={`/repo/${b.ownerLogin}/${b.name}`}
                  className="text-lg font-semibold hover:underline break-all"
                >
                  {b.ownerLogin}/{b.name}
                </Link>
                <a
                  href={b.htmlUrl}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Open on GitHub"
                  className="text-gray-500 hover:text-accent"
                >
                  <FiExternalLink size={14} />
                </a>
                <button
                  type="button"
                  disabled={busyId === b.repoId}
                  onClick={() => remove(b.repoId)}
                  className="ms-auto bg-glass border text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1 disabled:opacity-50"
                >
                  <FaBookmark className="text-accent" /> Remove
                </button>
              </div>

              <p className="text-sm text-gray-500">{b.description || "No description provided"}</p>

              <div className="flex flex-wrap items-center gap-2">
                <span className="pill pill-star">
                  <FaRegStar /> {b.stars}
                </span>
                <span className="pill pill-fork">
                  <FaCodeFork /> {b.forks}
                </span>
                {b.language && (
                  <span className="pill">{b.language}</span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default BookmarksPage;
