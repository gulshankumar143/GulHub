import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ProfileInfo from "../components/ProfileInfo";
import Repos from "../components/Repos";
import Search from "../components/Search";
import Spinner from "../components/Spinner";
import SortRepos from "../components/SortRepos";
import RepoFilters from "../components/RepoFilters";
import LanguageStats from "../components/LanguageStats";
import ErrorMessage from "../components/ErrorMessage";
import { useAuthContext } from "../../context/AuthContext";
import { useProfile } from "../hooks/useProfile";
import { languageCounts } from "../utils/stats";
import { DEFAULT_USERNAME } from "../utils/constants";

const byDate = (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime();

const SORTERS = {
  recent: byDate,
  stars: (a, b) => (b.stargazers_count ?? 0) - (a.stargazers_count ?? 0),
  forks: (a, b) => (b.forks_count ?? 0) - (a.forks_count ?? 0),
};

// Shown at "/" (your own profile when logged in) and at "/user/:username".
const HomePage = () => {
  const { username: routeUsername } = useParams();
  const navigate = useNavigate();
  const { authUser } = useAuthContext();

  const username = routeUsername || authUser?.username || DEFAULT_USERNAME;
  const { profile, repos, truncated, loading, error, reload } = useProfile(username);

  const [sortType, setSortType] = useState("recent");
  const [query, setQuery] = useState("");
  const [language, setLanguage] = useState("all");

  // New user -> reset sorting and filters
  useEffect(() => {
    setSortType("recent");
    setQuery("");
    setLanguage("all");
  }, [username]);

  useEffect(() => {
    document.title = profile ? `${profile.login} • GulHub` : "GulHub – Explore GitHub profiles";
    return () => {
      document.title = "GulHub – Explore GitHub profiles";
    };
  }, [profile]);

  const languages = useMemo(() => languageCounts(repos), [repos]);

  const visibleRepos = useMemo(() => {
    const q = query.trim().toLowerCase();

    return repos
      .filter((repo) => language === "all" || repo.language === language)
      .filter(
        (repo) =>
          !q ||
          repo.name.toLowerCase().includes(q) ||
          (repo.description || "").toLowerCase().includes(q)
      )
      .sort(SORTERS[sortType] || byDate);
  }, [repos, query, language, sortType]);

  const onSearch = (name) => navigate(`/user/${encodeURIComponent(name)}`);

  return (
    <div className="m-4">
      <div className="text-center mt-2">
        <h1 className="text-4xl font-extrabold tracking-tight text-gradient">GulHub</h1>
        <p className="text-sm text-gray-500 mt-1">Explore GitHub profiles, repos and stats</p>
      </div>
      <Search key={routeUsername || "home"} onSearch={onSearch} initialValue={routeUsername || ""} />

      {loading && (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      )}

      {!loading && error && (
        <ErrorMessage error={error} subject={`User "${username}"`} onRetry={reload} />
      )}

      {!loading && !error && profile && (
        <div className="flex gap-4 flex-col lg:flex-row justify-center items-start">
          <ProfileInfo userProfile={profile} />

          <div className="lg:w-2/3 w-full flex flex-col gap-3">
            <LanguageStats repos={repos} />

            <div>
              <SortRepos onSort={setSortType} sortType={sortType} />
              <RepoFilters
                query={query}
                onQueryChange={setQuery}
                language={language}
                onLanguageChange={setLanguage}
                languages={languages}
                shown={visibleRepos.length}
                total={repos.length}
              />
            </div>

            <Repos repos={visibleRepos} alwaysFullWidth />

            {truncated && (
              <p className="text-xs text-center text-gray-500">
                Showing the first {repos.length} repositories.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
