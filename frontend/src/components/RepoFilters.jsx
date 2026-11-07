import { IoSearch } from "react-icons/io5";

// Text search + language filter for a user's repos.
const RepoFilters = ({ query, onQueryChange, language, onLanguageChange, languages, shown, total }) => {
  return (
    <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
      <div className="relative flex-1">
        <IoSearch className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" />
        <input
          type="search"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Filter repos by name or description"
          aria-label="Filter repositories"
          className="w-full py-2 ps-9 pe-3 text-sm rounded-lg bg-glass bg-transparent focus:border-accent focus:outline-none"
        />
      </div>

      <select
        value={language}
        onChange={(e) => onLanguageChange(e.target.value)}
        aria-label="Filter by language"
        className="py-2 px-3 text-sm rounded-lg bg-glass bg-transparent focus:border-accent focus:outline-none"
      >
        <option value="all">All languages</option>
        {languages.map((l) => (
          <option key={l.name} value={l.name}>
            {l.name} ({l.value})
          </option>
        ))}
      </select>

      <span className="text-xs text-gray-500 whitespace-nowrap text-center">
        {shown} / {total} repos
      </span>
    </div>
  );
};

export default RepoFilters;
