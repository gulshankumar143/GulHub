import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "../utils/api";

const EMPTY = { loading: false, profile: null, repos: [], truncated: false, error: null };

// Loads a GitHub profile and all of its public repos from our backend.
export function useProfile(username) {
  const [state, setState] = useState({ ...EMPTY, loading: Boolean(username) });
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!username) {
      setState(EMPTY);
      return;
    }

    const controller = new AbortController();
    setState({ ...EMPTY, loading: true });

    apiFetch(`/api/users/profile/${encodeURIComponent(username)}`, {
      signal: controller.signal,
    })
      .then((data) =>
        setState({
          loading: false,
          profile: data.userProfile ?? null,
          repos: Array.isArray(data.repos) ? data.repos : [],
          truncated: Boolean(data.truncated),
          error: null,
        })
      )
      .catch((error) => {
        if (error.name === "AbortError") return;
        setState({ ...EMPTY, error });
      });

    return () => controller.abort();
  }, [username, reloadKey]);

  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  return { ...state, reload };
}
