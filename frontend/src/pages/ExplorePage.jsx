import { useState } from "react";
import toast from "react-hot-toast";
import { IoSearch } from "react-icons/io5";
import Spinner from "../components/Spinner";
import Repos from "../components/Repos";
import ErrorMessage from "../components/ErrorMessage";
import { apiFetch } from "../utils/api";
import { POPULAR_LANGUAGES } from "../utils/constants";

// Language logos shown as big clickable icons (value = language sent to GitHub)
const LOGOS = [
  { src: "/javascript.svg", alt: "JavaScript Logo", language: "javascript" },
  { src: "/typescript.svg", alt: "TypeScript Logo", language: "typescript" },
  { src: "/c++.svg", alt: "C++ Logo", language: "c++" },
  { src: "/python.svg", alt: "Python Logo", language: "python" },
  { src: "/java.svg", alt: "Java Logo", language: "java" },
];

const ExplorePage = () => {
  const [loading, setLoading] = useState(false);
  const [repos, setRepos] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [input, setInput] = useState("");
  const [error, setError] = useState(null);

  const exploreRepos = async (language) => {
    const lang = language.trim();
    if (!lang) return;

    setLoading(true);
    setRepos([]);
    setError(null);
    setSelectedLanguage(lang);
    try {
      // 5000 requests per hour for authenticated requests
      const data = await apiFetch(`/api/explore/repos/${encodeURIComponent(lang)}`);
      setRepos(data.repos || []);
      if ((data.repos || []).length === 0) toast("No repositories found for that language");
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    exploreRepos(input);
  };

  return (
    <div className="px-4">
      <div className="bg-glass max-w-2xl mx-auto rounded-md p-4">
        <h1 className="text-2xl font-bold text-center text-gradient">Explore Popular Repositories</h1>

        {/* Search any language */}
        <form onSubmit={onSubmit} className="relative my-4">
          <IoSearch className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" />
          <input
            type="search"
            list="language-options"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Search any language, e.g. Rust"
            aria-label="Language"
            className="w-full py-3 ps-9 pe-24 text-sm rounded-lg bg-glass bg-transparent focus:border-accent focus:outline-none"
          />
          <datalist id="language-options">
            {POPULAR_LANGUAGES.map((l) => (
              <option key={l} value={l} />
            ))}
          </datalist>
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="btn-primary absolute end-2 top-1/2 -translate-y-1/2 text-sm px-4 py-1.5"
          >
            Explore
          </button>
        </form>

        {/* Quick picks */}
        <div className="flex flex-wrap gap-2 my-2 justify-center">
          {LOGOS.map((logo) => (
            <img
              key={logo.language}
              src={logo.src}
              alt={logo.alt}
              className="h-11 sm:h-20 cursor-pointer"
              onClick={() => {
                setInput(logo.language);
                exploreRepos(logo.language);
              }}
            />
          ))}
        </div>

        <div className="flex flex-wrap gap-2 justify-center my-3">
          {POPULAR_LANGUAGES.map((lang) => (
            <button
              key={lang}
              type="button"
              onClick={() => {
                setInput(lang);
                exploreRepos(lang);
              }}
              className={`bg-glass text-xs px-3 py-1 rounded-full ${
                selectedLanguage.toLowerCase() === lang.toLowerCase() ? "border-accent" : ""
              }`}
            >
              {lang}
            </button>
          ))}
        </div>

        {error && <ErrorMessage error={error} onRetry={() => exploreRepos(selectedLanguage)} />}

        {repos.length > 0 && (
          <h2 className="text-lg font-semibold text-center my-4">
            <span className="pill pill-topic text-sm me-2">
              {selectedLanguage.toUpperCase()}{" "}
            </span>
            Repositories
          </h2>
        )}
        {!loading && repos.length > 0 && <Repos repos={repos} alwaysFullWidth />}
        {loading && <Spinner />}
      </div>
    </div>
  );
};

export default ExplorePage;
