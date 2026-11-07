export function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  // All callers are fetch() requests, so answer with JSON instead of a redirect.
  return res.status(401).json({ error: "Please log in to continue" });
}
