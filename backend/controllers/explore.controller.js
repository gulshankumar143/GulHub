import { githubRequest, sendError, toGithubError } from "../utils/github.js";
import { cached } from "../utils/cache.js";

const LANGUAGE_RE = /^[\w .+#-]{1,40}$/;

export const explorePopularRepos = async (req, res) => {
  const language = String(req.params.language || "").trim();

  if (!LANGUAGE_RE.test(language)) {
    return res.status(400).json({ error: "Please enter a valid language name" });
  }

  try {
    const repos = await cached(`explore:${language.toLowerCase()}`, 10 * 60 * 1000, async () => {
      const q = encodeURIComponent(`language:"${language}"`);
      const { res: ghRes, data, ok } = await githubRequest(
        `/search/repositories?q=${q}&sort=stars&order=desc&per_page=10`
      );
      if (!ok) throw toGithubError(ghRes, data);
      return data.items || [];
    });

    return res.status(200).json({ repos });
  } catch (error) {
    return sendError(res, error, "Unable to explore repositories");
  }
};
