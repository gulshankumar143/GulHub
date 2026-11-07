import { LANGUAGE_COLORS } from "./constants";

export function languageColor(name) {
  if (LANGUAGE_COLORS[name]) return LANGUAGE_COLORS[name];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) | 0;
  return `hsl(${Math.abs(hash) % 360} 55% 50%)`;
}

// [{ name, value }] sorted by number of repos, most used first
export function languageCounts(repos) {
  const counts = new Map();
  for (const repo of repos) {
    if (!repo.language) continue;
    counts.set(repo.language, (counts.get(repo.language) || 0) + 1);
  }
  return [...counts.entries()]
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value || a.name.localeCompare(b.name));
}

// Top N languages, the rest grouped as "Other"
export function topLanguages(repos, limit = 6) {
  const all = languageCounts(repos);
  const top = all.slice(0, limit);
  const rest = all.slice(limit).reduce((sum, l) => sum + l.value, 0);
  if (rest > 0) top.push({ name: "Other", value: rest });
  return top.map((l) => ({ ...l, color: languageColor(l.name) }));
}

export const totalStars = (repos) =>
  repos.reduce((sum, r) => sum + (r.stargazers_count || 0), 0);

export const totalForks = (repos) =>
  repos.reduce((sum, r) => sum + (r.forks_count || 0), 0);
