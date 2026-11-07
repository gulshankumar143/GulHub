import express from "express";
import mongoose from "mongoose";
import passport from "passport";
import { SESSION_COOKIE } from "../config.js";

const router = express.Router();

const clientUrl = () =>
  (process.env.CLIENT_BASE_URL || "http://localhost:3000").replace(/\/+$/, "");

const toLogin = (res, message) =>
  res.redirect(`${clientUrl()}/login?error=${encodeURIComponent(message)}`);

// Turn low-level OAuth / database errors into something a person can act on
const friendlyError = (err) => {
  const name = err?.name || "";
  if (name === "TokenError") {
    return "GitHub rejected the login. Check GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET and the callback URL.";
  }
  if (name === "InternalOAuthError") {
    return "Could not reach GitHub. Check your internet connection and try again.";
  }
  if (/mongo/i.test(name) || /mongo|buffering timed out/i.test(err?.message || "")) {
    return "Database error. Check MONGO_URL and your MongoDB Atlas IP allowlist.";
  }
  return "Login failed. Please try again.";
};

// The frontend can use this to find out whether login can work at all
router.get("/status", (req, res) => {
  res.json({ dbReady: mongoose.connection.readyState === 1 });
});

router.get(
  "/github",
  (req, res, next) => {
    if (mongoose.connection.readyState !== 1) {
      return toLogin(
        res,
        "The database is not connected, so login is unavailable. Check MONGO_URL in .env."
      );
    }
    next();
  },
  passport.authenticate("github", { scope: ["user:email"] })
);

router.get("/github/callback", (req, res, next) => {
  passport.authenticate("github", (err, user) => {
    if (err) {
      console.error("GitHub login error:", err.message || err);
      return toLogin(res, friendlyError(err));
    }
    if (!user) {
      return toLogin(res, "GitHub login was cancelled or denied.");
    }
    req.logIn(user, (loginErr) => {
      if (loginErr) {
        console.error("Session error during login:", loginErr.message || loginErr);
        return toLogin(res, friendlyError(loginErr));
      }
      console.log(`✅ Logged in as ${user.username}`);
      // ?login=success lets the frontend confirm the sign-in (or explain a lost session)
      return res.redirect(`${clientUrl()}/?login=success`);
    });
  })(req, res, next);
});

router.get("/check", (req, res) => {
  if (req.isAuthenticated()) {
    res.send({ user: req.user });
  } else {
    res.send({ user: null });
  }
});

router.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie(SESSION_COOKIE);
    res.json({ message: "Logged out" });
  });
});

export default router;
