import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import { FaCodeFork } from "react-icons/fa6";
import { FaEye, FaRegStar } from "react-icons/fa";
import { FiExternalLink } from "react-icons/fi";
import { VscIssues } from "react-icons/vsc";
import Spinner from "../components/Spinner";
import ErrorMessage from "../components/ErrorMessage";
import { BookmarkButton } from "../components/BookmarkButton";
import { apiFetch } from "../utils/api";
import { formatDate } from "../utils/funtions";

const isAbsolute = (url) => /^([a-z][a-z0-9+.-]*:|\/\/)/i.test(url);

const Stat = ({ icon, label, value }) => (
  <div className="bg-glass rounded-lg px-3 py-2 flex items-center gap-2 text-sm">
    {icon}
    <span className="text-gray-500">{label}</span>
    <span className="font-semibold">{value ?? 0}</span>
  </div>
);

export const RepoView = ({ data, owner, name }) => {
  const { repo, readme, contributors, commits } = data;
  const branch = repo?.default_branch || "main";

  // README files use relative links/images; point them at GitHub
  const markdownComponents = useMemo(
    () => ({
      img: ({ src, alt }) => {
        if (!src) return null;
        const url = isAbsolute(src)
          ? src
          : `https://raw.githubusercontent.com/${owner}/${name}/${branch}/${src.replace(/^\.?\//, "")}`;
        return <img src={url} alt={alt || ""} loading="lazy" />;
      },
      a: ({ href, children }) => {
        const url = !href
          ? "#"
          : isAbsolute(href)
          ? href
          : href.startsWith("#")
          ? `https://github.com/${owner}/${name}${href}`
          : `https://github.com/${owner}/${name}/blob/${branch}/${href.replace(/^\.?\//, "")}`;
        return (
          <a href={url} target="_blank" rel="noreferrer">
            {children}
          </a>
        );
      },
    }),
    [owner, name, branch]
  );

  return (
    <div className="m-4 flex flex-col gap-4">
      {/* Header */}
      <div className="bg-glass rounded-lg p-6 flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <Link to={`/user/${repo.owner.login}`} className="flex items-center gap-2 hover:underline">
            <img src={repo.owner.avatar_url} alt="" className="w-8 h-8 rounded-full" />
            <span className="text-lg">{repo.owner.login}</span>
          </Link>
          <span className="text-gray-500 text-lg">/</span>
          <h1 className="text-2xl font-bold break-all">{repo.name}</h1>
          <a
            href={repo.html_url}
            target="_blank"
            rel="noreferrer"
            className="bg-glass border text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1"
          >
            <FiExternalLink /> GitHub
          </a>
          <BookmarkButton repo={repo} withLabel />
        </div>

        <p className="text-gray-500">{repo.description || "No description provided"}</p>

        {repo.topics.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {repo.topics.map((topic) => (
              <span key={topic} className="pill pill-topic">
                {topic}
              </span>
            ))}
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <Stat icon={<FaRegStar />} label="Stars" value={repo.stargazers_count} />
          <Stat icon={<FaCodeFork />} label="Forks" value={repo.forks_count} />
          <Stat icon={<FaEye />} label="Watchers" value={repo.watchers_count} />
          <Stat icon={<VscIssues />} label="Open issues" value={repo.open_issues_count} />
        </div>

        <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-gray-500">
          {repo.language && <span>Language: {repo.language}</span>}
          {repo.license && <span>License: {repo.license}</span>}
          <span>Created: {formatDate(repo.created_at)}</span>
          <span>Last push: {formatDate(repo.pushed_at)}</span>
          {repo.homepage && (
            <a href={repo.homepage} target="_blank" rel="noreferrer" className="hover:text-accent">
              {repo.homepage}
            </a>
          )}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 items-start">
        {/* README */}
        <div className="bg-glass rounded-lg p-6 w-full lg:w-2/3 min-w-0">
          <h2 className="text-sm font-semibold mb-3">README</h2>
          {readme ? (
            <div className="markdown-body">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw, rehypeSanitize]}
                components={markdownComponents}
              >
                {readme}
              </ReactMarkdown>
            </div>
          ) : (
            <p className="text-sm text-gray-500">This repository has no README.</p>
          )}
        </div>

        <div className="w-full lg:w-1/3 flex flex-col gap-4 min-w-0">
          {/* Contributors */}
          <div className="bg-glass rounded-lg p-4">
            <h2 className="text-sm font-semibold mb-3">Contributors</h2>
            {contributors.length === 0 ? (
              <p className="text-sm text-gray-500">No contributor data.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {contributors.map((c) => (
                  <Link
                    key={c.login}
                    to={`/user/${c.login}`}
                    title={`${c.login} (${c.contributions} commits)`}
                  >
                    <img src={c.avatar_url} alt={c.login} className="w-10 h-10 rounded-full" />
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Recent commits */}
          <div className="bg-glass rounded-lg p-4">
            <h2 className="text-sm font-semibold mb-3">Recent commits</h2>
            {commits.length === 0 ? (
              <p className="text-sm text-gray-500">No commits found.</p>
            ) : (
              <ul className="flex flex-col gap-3">
                {commits.map((c) => (
                  <li key={c.sha} className="text-sm">
                    <a href={c.html_url} target="_blank" rel="noreferrer" className="font-medium hover:underline break-words">
                      {c.message || "(no message)"}
                    </a>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                      {c.avatar_url && <img src={c.avatar_url} alt="" className="w-4 h-4 rounded-full" />}
                      <span>{c.author}</span>
                      <span>•</span>
                      <code>{c.sha}</code>
                      <span>•</span>
                      <span>{c.date ? new Date(c.date).toLocaleDateString() : ""}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const RepoPage = () => {
  const { owner, name } = useParams();
  const [state, setState] = useState({ loading: true, data: null, error: null });
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setState({ loading: true, data: null, error: null });

    apiFetch(`/api/repos/${encodeURIComponent(owner)}/${encodeURIComponent(name)}`, {
      signal: controller.signal,
    })
      .then((data) => setState({ loading: false, data, error: null }))
      .catch((error) => {
        if (error.name !== "AbortError") setState({ loading: false, data: null, error });
      });

    return () => controller.abort();
  }, [owner, name, reloadKey]);

  useEffect(() => {
    document.title = `${owner}/${name} • GulHub`;
    return () => {
      document.title = "GulHub – Explore GitHub profiles";
    };
  }, [owner, name]);

  const retry = useCallback(() => setReloadKey((k) => k + 1), []);

  if (state.loading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner />
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="m-4">
        <ErrorMessage error={state.error} subject={`Repository "${owner}/${name}"`} onRetry={retry} />
      </div>
    );
  }

  return <RepoView data={state.data} owner={owner} name={name} />;
};

export default RepoPage;
