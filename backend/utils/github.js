// Shared helpers for talking to the GitHub REST API.
const API = "https://api.github.com";

export class GithubError extends Error {
  constructor(status, message, extra = {}) {
    super(message);
    this.status = status;
    this.rateLimited = Boolean(extra.rateLimited);
  }
}

// Env vars are read lazily because dotenv is configured after imports run.
export function githubHeaders(accept = "application/vnd.github+json") {
  const headers = {
    Accept: accept,
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "GulHub",
  };
  if (process.env.GITHUB_API_KEY) {
    headers.Authorization = `Bearer ${process.env.GITHUB_API_KEY}`;
  }
  return headers;
}

export async function githubRequest(path, { accept, text = false } = {}) {
  const url = path.startsWith("http") ? path : `${API}${path}`;
  const res = await fetch(url, { headers: githubHeaders(accept) });

  let data = null;
  if (res.status !== 204) {
    try {
      data = text && res.ok ? await res.text() : await res.json();
    } catch {
      data = null;
    }
  }
  return { res, data, ok: res.ok };
}

export function hasNextPage(res) {
  return /rel="next"/.test(res.headers.get("link") || "");
}

export function isRateLimited(res, data) {
  if (res.status === 429) return true;
  if (res.status !== 403) return false;
  return (
    res.headers.get("x-ratelimit-remaining") === "0" ||
    /rate limit/i.test(data?.message || "")
  );
}

export function toGithubError(res, data, notFoundMessage = "Not found on GitHub") {
  if (isRateLimited(res, data)) {
    const reset = Number(res.headers.get("x-ratelimit-reset")) || null;
    const minutes = reset
      ? Math.max(1, Math.ceil((reset * 1000 - Date.now()) / 60000))
      : null;
    const wait = minutes
      ? ` Try again in about ${minutes} minute${minutes > 1 ? "s" : ""}.`
      : " Please try again later.";
    return new GithubError(429, `GitHub API rate limit reached.${wait}`, {
      rateLimited: true,
    });
  }
  if (res.status === 404) return new GithubError(404, notFoundMessage);
  const status = res.status >= 400 && res.status < 600 ? res.status : 502;
  return new GithubError(status, data?.message || "GitHub request failed");
}

export function sendError(resp, error, fallback = "Something went wrong") {
  if (error instanceof GithubError) {
    return resp
      .status(error.status)
      .json({ error: error.message, rateLimited: error.rateLimited });
  }
  console.error(error);
  return resp.status(500).json({ error: fallback });
}
