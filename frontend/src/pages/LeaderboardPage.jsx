import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaHeart } from "react-icons/fa";
import Spinner from "../components/Spinner";
import ErrorMessage from "../components/ErrorMessage";
import { apiFetch } from "../utils/api";

const MEDALS = ["🥇", "🥈", "🥉"];

const LeaderboardPage = () => {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    document.title = "Leaderboard • GulHub";
    const controller = new AbortController();

    apiFetch("/api/users/leaderboard", { signal: controller.signal })
      .then((data) => setLeaders(data.leaders || []))
      .catch((err) => err.name !== "AbortError" && setError(err))
      .finally(() => !controller.signal.aborted && setLoading(false));

    return () => {
      controller.abort();
      document.title = "GulHub – Explore GitHub profiles";
    };
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="m-4">
        <ErrorMessage error={error} />
      </div>
    );
  }

  return (
    <div className="px-4">
      <h1 className="text-2xl font-bold text-center mb-4 text-gradient">Most liked GulHub members</h1>

      {leaders.length === 0 ? (
        <p className="text-center text-gray-500">No members yet. Sign up and get some likes!</p>
      ) : (
        <ol className="bg-glass rounded-lg max-w-2xl mx-auto overflow-hidden">
          {leaders.map((user, idx) => (
            <li
              key={user.username}
              className={`flex items-center gap-4 px-4 py-3 border-b last:border-b-0 ${idx === 0 ? "bg-gradient-to-r from-amber-400/15 to-transparent" : ""}`}
              style={{ borderColor: "var(--border)" }}
            >
              <span className="w-8 text-center text-lg font-bold">{MEDALS[idx] || idx + 1}</span>
              <img src={user.avatarUrl} alt="" className="w-10 h-10 rounded-full" />
              <Link to={`/user/${user.username}`} className="flex-1 min-w-0 hover:underline">
                <div className="font-semibold truncate">{user.username}</div>
                {user.name && <div className="text-xs text-gray-500 truncate">{user.name}</div>}
              </Link>
              <span className="flex items-center gap-2 font-semibold">
                <FaHeart className="text-rose-500" /> {user.likes}
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
};

export default LeaderboardPage;
