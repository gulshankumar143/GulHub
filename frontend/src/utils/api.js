export class ApiError extends Error {
  constructor(message, status = 0, extra = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.rateLimited = Boolean(extra.rateLimited);
  }
}

// Small fetch wrapper: sends cookies, parses JSON and throws ApiError on failure.
export async function apiFetch(url, options = {}) {
  const { body, headers, ...rest } = options;

  let res;
  try {
    res = await fetch(url, {
      credentials: "include",
      ...rest,
      headers: {
        ...(body ? { "Content-Type": "application/json" } : {}),
        ...(headers || {}),
      },
      body,
    });
  } catch (error) {
    if (error.name === "AbortError") throw error;
    throw new ApiError("Cannot reach the server. Is the backend running?", 0);
  }

  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok || data?.error) {
    throw new ApiError(data?.error || `Request failed (${res.status})`, res.status, {
      rateLimited: data?.rateLimited || res.status === 429,
    });
  }

  return data;
}
