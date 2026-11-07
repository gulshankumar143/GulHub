import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Search from "../components/Search";
import Spinner from "../components/Spinner";
import { useProfile } from "../hooks/useProfile";
import { formatMemberSince } from "../utils/funtions";
import { topLanguages, totalForks, totalStars } from "../utils/stats";

// Rows with numbers highlight the larger value.
const ROWS = [
  { label: "Followers", get: (p) => p.followers, numeric: true },
  { label: "Following", get: (p) => p.following, numeric: true },
  { label: "Public repos", get: (p) => p.public_repos, numeric: true },
  { label: "Public gists", get: (p) => p.public_gists, numeric: true },
  { label: "Total stars", get: (_p, repos) => totalStars(repos), numeric: true },
  { label: "Total forks", get: (_p, repos) => totalForks(repos), numeric: true },
  {
    label: "Top languages",
    get: (_p, repos) =>
      topLanguages(repos, 3)
        .filter((l) => l.name !== "Other")
        .map((l) => l.name)
        .join(", ") || "—",
  },
  { label: "Member since", get: (p) => formatMemberSince(p.created_at) },
];

// What to show in the header cell of each column
const Header = ({ result, username }) => {
  if (!username) return <p className="text-sm text-gray-500">Pick a user</p>;
  if (result.loading) return <Spinner />;

  if (result.error) {
    const text = result.error.rateLimited
      ? result.error.message
      : result.error.status === 404
      ? `User "${username}" not found`
      : result.error.message;
    return (
      <div className="flex flex-col items-center gap-2">
        <p className="text-sm text-red-400 max-w-48">{text}</p>
        {result.error.status !== 404 && (
          <button type="button" onClick={result.reload} className="btn-primary px-3 py-1 text-xs">
            Retry
          </button>
        )}
      </div>
    );
  }

  const p = result.profile;
  if (!p) return null;
  return (
    <a href={p.html_url} target="_blank" rel="noreferrer" className="flex flex-col items-center gap-1">
      <img src={p.avatar_url} alt="" className="w-20 h-20 rounded-xl avatar-ring" />
      <span className="font-semibold">{p.name || p.login}</span>
      <span className="text-xs text-gray-500">@{p.login}</span>
    </a>
  );
};

const ComparePage = () => {
  const [params, setParams] = useSearchParams();
  const a = (params.get("a") || "").trim();
  const b = (params.get("b") || "").trim();

  const first = useProfile(a);
  const second = useProfile(b);

  useEffect(() => {
    document.title = "Compare users • GulHub";
    return () => {
      document.title = "GulHub – Explore GitHub profiles";
    };
  }, []);

  const setUser = (key, value) => {
    const next = new URLSearchParams(params);
    next.set(key, value.trim());
    setParams(next);
  };

  const anyLoaded = Boolean(first.profile || second.profile);
  const bothLoaded = Boolean(first.profile && second.profile);
  const show = (result, row) => (result.profile ? row.get(result.profile, result.repos) : "—");

  return (
    <div className="m-4 flex flex-col gap-4">
      <h1 className="text-2xl font-bold text-center text-gradient">Compare two GitHub users</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <Search
          key={`a-${a}`}
          initialValue={a}
          placeholder="First username"
          buttonText="Set"
          onSearch={(v) => setUser("a", v)}
        />
        <Search
          key={`b-${b}`}
          initialValue={b}
          placeholder="Second username"
          buttonText="Set"
          onSearch={(v) => setUser("b", v)}
        />
      </div>

      {!a && !b && (
        <p className="text-center text-sm text-gray-500">
          Enter two GitHub usernames to see their stats side by side.
        </p>
      )}

      {(a || b) && (
        <div className="bg-glass rounded-lg overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="p-4 w-1/4" />
                <th className="p-4 text-center align-top">
                  <Header result={first} username={a} />
                </th>
                <th className="p-4 text-center align-top">
                  <Header result={second} username={b} />
                </th>
              </tr>
            </thead>
            <tbody>
              {anyLoaded &&
                ROWS.map((row) => {
                  const va = show(first, row);
                  const vb = show(second, row);
                  const aWins = bothLoaded && row.numeric && va > vb;
                  const bWins = bothLoaded && row.numeric && vb > va;
                  const winner = "text-green-500 font-bold";
                  return (
                    <tr key={row.label} className="border-t" style={{ borderColor: "var(--border)" }}>
                      <td className="p-3 text-gray-500 font-medium">{row.label}</td>
                      <td className={`p-3 text-center ${aWins ? winner : ""}`}>{va}</td>
                      <td className={`p-3 text-center ${bWins ? winner : ""}`}>{vb}</td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      )}

      {(a ? !b : b) && (
        <p className="text-center text-sm text-gray-500">
          Add a {a ? "second" : "first"} username above to compare.
        </p>
      )}
    </div>
  );
};

export default ComparePage;
