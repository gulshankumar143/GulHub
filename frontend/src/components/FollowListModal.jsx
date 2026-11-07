import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IoClose } from "react-icons/io5";
import Spinner from "./Spinner";
import { apiFetch } from "../utils/api";

// Popup listing a user's followers or following (30 per page).
const FollowListModal = ({ username, type, onClose }) => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(
    async (pageToLoad, signal) => {
      setLoading(true);
      setError(null);
      try {
        const data = await apiFetch(
          `/api/users/profile/${encodeURIComponent(username)}/${type}?page=${pageToLoad}`,
          { signal }
        );
        setUsers((prev) => (pageToLoad === 1 ? data.users : [...prev, ...data.users]));
        setHasMore(data.hasMore);
        setPage(pageToLoad);
      } catch (err) {
        if (err.name !== "AbortError") setError(err.message);
      } finally {
        if (!signal?.aborted) setLoading(false);
      }
    },
    [username, type]
  );

  useEffect(() => {
    const controller = new AbortController();
    setUsers([]);
    load(1, controller.signal);
    return () => controller.abort();
  }, [load]);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const goTo = (login) => {
    onClose();
    navigate(`/user/${login}`);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`${username} ${type}`}
    >
      <div
        className="w-full max-w-md max-h-[80vh] flex flex-col rounded-lg border"
        style={{ backgroundColor: "var(--tooltip-bg)", borderColor: "var(--border)", color: "var(--fg)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: "var(--border)" }}>
          <h2 className="font-semibold capitalize">
            {username}&apos;s {type}
          </h2>
          <button type="button" onClick={onClose} aria-label="Close" className="nav-item">
            <IoClose size={22} />
          </button>
        </div>

        <ul className="overflow-y-auto p-2 flex-1">
          {users.map((u) => (
            <li key={u.login}>
              <button
                type="button"
                onClick={() => goTo(u.login)}
                className="w-full flex items-center gap-3 p-2 rounded-lg text-left hover:bg-accent/10"
              >
                <img src={u.avatar_url} alt="" className="w-9 h-9 rounded-full" />
                <span className="text-sm font-medium">{u.login}</span>
              </button>
            </li>
          ))}

          {!loading && !error && users.length === 0 && (
            <p className="text-center text-sm text-gray-500 py-8">Nobody here yet</p>
          )}
          {error && <p className="text-center text-sm text-red-400 py-4">{error}</p>}
          {loading && (
            <div className="py-4">
              <Spinner />
            </div>
          )}
        </ul>

        {hasMore && !loading && (
          <div className="p-3 border-t text-center" style={{ borderColor: "var(--border)" }}>
            <button
              type="button"
              className="btn-primary px-4 py-2 text-sm"
              onClick={() => load(page + 1)}
            >
              Load more
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FollowListModal;
