import { useEffect, useRef, useState } from "react";
import { IoSearch } from "react-icons/io5";
import { apiFetch } from "../utils/api";

const DEBOUNCE_MS = 400;

// Search box with debounced GitHub username suggestions.
const Search = ({
  onSearch,
  initialValue = "",
  placeholder = "i.e. johndoe",
  buttonText = "Search",
}) => {
  const [username, setUsername] = useState(initialValue);
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const skipNextFetch = useRef(false);

  useEffect(() => {
    // Don't re-open suggestions right after one was picked
    if (skipNextFetch.current) {
      skipNextFetch.current = false;
      return;
    }

    const term = username.trim();
    if (term.length < 2) {
      setSuggestions([]);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const data = await apiFetch(`/api/users/search?q=${encodeURIComponent(term)}`, {
          signal: controller.signal,
        });
        setSuggestions(data.users || []);
        setActiveIndex(-1);
        setOpen(true);
      } catch {
        // suggestions are optional: ignore errors (e.g. rate limit)
        setSuggestions([]);
      }
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [username]);

  const submit = (value) => {
    const name = value.trim();
    if (!name) return;
    setOpen(false);
    onSearch(name);
  };

  const pick = (login) => {
    skipNextFetch.current = true;
    setUsername(login);
    setSuggestions([]);
    submit(login);
  };

  const onKeyDown = (e) => {
    if (!open || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      pick(suggestions[activeIndex].login);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <form
      className="max-w-xl mx-auto p-2"
      onSubmit={(e) => {
        e.preventDefault();
        submit(username);
      }}
    >
      <div className="relative">
        <div className="absolute inset-y-0 start-0 flex items-center z-10 ps-3 pointer-events-none">
          <IoSearch className="w-5 h-5" />
        </div>
        <input
          type="search"
          className="block w-full p-4 ps-10 pe-28 text-sm rounded-lg bg-glass focus:ring-accent focus:border-accent bg-transparent focus:bg-transparent"
          placeholder={placeholder}
          aria-label={placeholder}
          autoComplete="off"
          required
          value={username}
          onChange={(e) => {
            setUsername(e.target.value);
            setOpen(true);
          }}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          onBlur={() => setOpen(false)}
          onKeyDown={onKeyDown}
        />
        <button
          type="submit"
          className="btn-primary absolute end-2.5 bottom-2.5 text-sm px-4 py-2 focus:outline-none focus:ring-4 focus:ring-accent/40"
        >
          {buttonText}
        </button>

        {open && suggestions.length > 0 && (
          <ul
            className="absolute z-30 mt-1 w-full rounded-lg border overflow-hidden backdrop-blur-md"
            style={{ backgroundColor: "var(--tooltip-bg)", borderColor: "var(--border)" }}
            role="listbox"
          >
            {suggestions.map((user, idx) => (
              <li
                key={user.login}
                role="option"
                aria-selected={idx === activeIndex}
                // mousedown (not click) so it fires before the input's blur closes the list
                onMouseDown={(e) => {
                  e.preventDefault();
                  pick(user.login);
                }}
                className={`flex items-center gap-3 px-3 py-2 cursor-pointer text-sm ${
                  idx === activeIndex ? "bg-accent/20" : "hover:bg-accent/10"
                }`}
              >
                <img src={user.avatar_url} alt="" className="w-6 h-6 rounded-full" />
                {user.login}
              </li>
            ))}
          </ul>
        )}
      </div>
    </form>
  );
};

export default Search;
