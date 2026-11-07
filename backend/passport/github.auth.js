import passport from "passport";
import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Strategy as GitHubStrategy } from "passport-github2";
import User from "../models/user.model.js";

// Resolve the .env file in the GulHub project root
const currentFile = fileURLToPath(import.meta.url);
const currentDir = path.dirname(currentFile);

dotenv.config({
  path: path.resolve(currentDir, "../../.env"),
});

// Verify configuration without exposing credentials
if (!process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_CLIENT_SECRET) {
  throw new Error(
    "GitHub OAuth credentials missing. Check the GulHub root .env file."
  );
}

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL:
        process.env.GITHUB_CALLBACK_URL ||
        "http://localhost:5000/api/auth/github/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({
          username: profile.username,
        });

        if (!user) {
          user = await User.create({
            name: profile.displayName || profile.username,
            username: profile.username,
            profileUrl: profile.profileUrl,
            avatarUrl: profile.photos?.[0]?.value || "",
            likedProfiles: [],
            likedBy: [],
          });
        }

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);
