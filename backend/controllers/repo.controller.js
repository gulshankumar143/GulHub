import {
  githubRequest,
  isRateLimited,
  sendError,
  toGithubError,
} from "../utils/github.js";
import { cached } from "../utils/cache.js";

const NAME_RE = /^[A-Za-z0-9_.-]{1,100}$/;
const FIVE_MINUTES = 5 * 60 * 1000;

export const getRepoDetails = async (req, res) => {
  const { owner, repo } = req.params;

  if (!NAME_RE.test(owner) || !NAME_RE.test(repo)) {
    return res.status(400).json({ error: "Invalid repository name" });
  }

  try {
    const data = await cached(`repo:${owner}/${repo}`.toLowerCase(), FIVE_MINUTES, async () => {
      const base = `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`;

      const [info, readme, contributors, commits] = await Promise.all([
        githubRequest(base),
        githubRequest(`${base}/readme`, {
          accept: "application/vnd.github.raw+json",
          text: true,
        }),
        githubRequest(`${base}/contributors?per_page=12`),
        githubRequest(`${base}/commits?per_page=10`),
      ]);

      if (!info.ok) {
        throw toGithubError(info.res, info.data, `Repository "${owner}/${repo}" was not found`);
      }

      // Missing README / empty repo are normal; a rate limit is not.
      const limited = [readme, contributors, commits].find((r) =>
        isRateLimited(r.res, r.data)
      );
      if (limited) throw toGithubError(limited.res, limited.data);

      const r = info.data;

      return {
        repo: {
          id: r.id,
          name: r.name,
          full_name: r.full_name,
          description: r.description,
          html_url: r.html_url,
          homepage: r.homepage,
          language: r.language,
          stargazers_count: r.stargazers_count,
          forks_count: r.forks_count,
          watchers_count: r.subscribers_count ?? r.watchers_count,
          open_issues_count: r.open_issues_count,
          topics: r.topics || [],
          license: r.license?.name || null,
          created_at: r.created_at,
          pushed_at: r.pushed_at,
          default_branch: r.default_branch,
          owner: { login: r.owner?.login, avatar_url: r.owner?.avatar_url },
        },
        readme: readme.ok && typeof readme.data === "string" ? readme.data.slice(0, 100000) : null,
        contributors:
          contributors.ok && Array.isArray(contributors.data)
            ? contributors.data.map((c) => ({
                login: c.login,
                avatar_url: c.avatar_url,
                html_url: c.html_url,
                contributions: c.contributions,
              }))
            : [],
        commits:
          commits.ok && Array.isArray(commits.data)
            ? commits.data.map((c) => ({
                sha: c.sha?.slice(0, 7),
                message: (c.commit?.message || "").split("\n")[0].slice(0, 200),
                author: c.author?.login || c.commit?.author?.name || "unknown",
                avatar_url: c.author?.avatar_url || null,
                date: c.commit?.author?.date,
                html_url: c.html_url,
              }))
            : [],
      };
    });

    return res.status(200).json(data);
  } catch (error) {
    return sendError(res, error, "Unable to load repository");
  }
};
