import { Link } from "react-router-dom";
import { FaCodeBranch, FaCopy, FaRegStar } from "react-icons/fa";
import { FaCodeFork } from "react-icons/fa6";
import { FiExternalLink } from "react-icons/fi";
import { formatDate } from "../utils/funtions";
import { PROGRAMMING_LANGUAGES } from "../utils/constants";
import toast from "react-hot-toast";
import { BookmarkButton } from "./BookmarkButton";

const Repo = ({ repo }) => {
  const formattedDate = formatDate(repo.created_at);

  const handleOnClick = async (repo) => {
    try {
      await navigator.clipboard.writeText(repo.clone_url);
      toast.success("Repo URL cloned to clipboard");
    } catch {
      toast.error("Clipboard write failed.");
    }
  };

  const owner = repo.owner?.login;

  return (
    <li className="mb-10 ms-7">
      <span className="timeline-dot absolute flex items-center justify-center w-6 h-6 rounded-full -start-3">
        <FaCodeBranch className="w-3.5 h-3.5 text-white" />
      </span>
      <div className="flex gap-2 items-center flex-wrap">
        {/* Opens the in-app repo detail page */}
        <Link
          to={owner ? `/repo/${owner}/${repo.name}` : "#"}
          className="flex items-center gap-2 text-lg font-semibold hover:text-accent transition-colors"
        >
          {repo.name}
        </Link>
        <a
          href={repo.html_url}
          target="_blank"
          rel="noreferrer"
          title="Open on GitHub"
          aria-label="Open on GitHub"
          className="text-gray-500 hover:text-accent"
        >
          <FiExternalLink size={14} />
        </a>
        <span className="pill pill-star">
          <FaRegStar /> {repo.stargazers_count}
        </span>
        <span className="pill pill-fork">
          <FaCodeFork /> {repo.forks_count}
        </span>
        <span onClick={() => handleOnClick(repo)} className="pill pill-clone">
          <FaCopy /> Clone
        </span>
        <BookmarkButton repo={repo} />
      </div>
      <time className="block my-1 text-xs font-normal leading-none text-gray-400">
        Released on {formattedDate}
      </time>
      <p className="mb-4 text-base font-normal text-gray-500">
        {repo.description ? repo.description.slice(0, 500) : "No description provided"}
      </p>
      {PROGRAMMING_LANGUAGES[repo.language] ? (
        <img
          src={PROGRAMMING_LANGUAGES[repo.language]}
          alt={`${repo.language} icon`}
          className="h-8"
        />
      ) : repo.language ? (
        <span className="pill">{repo.language}</span>
      ) : null}
    </li>
  );
};

export default Repo;
