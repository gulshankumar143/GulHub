import { useState } from "react";
import { FaBookmark, FaRegBookmark } from "react-icons/fa";
import toast from "react-hot-toast";
import { useAuthContext } from "../../context/AuthContext";
import { apiFetch } from "../utils/api";

// Save / remove a repo from the logged-in user's bookmarks.
// `repo` is a GitHub repository object.
export const BookmarkButton = ({ repo, withLabel = false }) => {
  const { authUser, setAuthUser } = useAuthContext();
  const [busy, setBusy] = useState(false);

  if (!authUser || !repo?.id) return null;

  const saved = (authUser.bookmarks || []).some((b) => b.repoId === repo.id);

  const toggle = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const data = saved
        ? await apiFetch(`/api/users/bookmarks/${repo.id}`, { method: "DELETE" })
        : await apiFetch("/api/users/bookmarks", {
            method: "POST",
            body: JSON.stringify({
              id: repo.id,
              name: repo.name,
              description: repo.description,
              language: repo.language,
              stargazers_count: repo.stargazers_count,
              forks_count: repo.forks_count,
              owner: { login: repo.owner?.login },
            }),
          });

      setAuthUser((prev) => (prev ? { ...prev, bookmarks: data.bookmarks } : prev));
      toast.success(saved ? "Bookmark removed" : "Repository bookmarked");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      title={saved ? "Remove bookmark" : "Bookmark this repo"}
      aria-label={saved ? "Remove bookmark" : "Bookmark this repo"}
      className={`pill cursor-pointer disabled:opacity-50 ${saved ? "pill-topic" : ""}`}
    >
      {saved ? <FaBookmark /> : <FaRegBookmark />}
      {withLabel && (saved ? "Bookmarked" : "Bookmark")}
    </button>
  );
};
