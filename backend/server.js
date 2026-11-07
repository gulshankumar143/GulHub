import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Always load the .env that sits in the project root, wherever the server is started from
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

import express from "express";
import cors from "cors";
import passport from "passport";
import session from "express-session";

import "./passport/github.auth.js";

import userRoutes from "./routes/user.route.js";
import exploreRoutes from "./routes/explore.route.js";
import repoRoutes from "./routes/repo.route.js";
import authRoutes from "./routes/auth.route.js";

import connectMongoDB from "./db/connectMongoDB.js";
import { SESSION_COOKIE } from "./config.js";

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = (process.env.CLIENT_BASE_URL || "http://localhost:3000").replace(/\/+$/, "");

// Sessions are kept in MongoDB so logins survive restarts. If the database or the
// connect-mongo package is unavailable we fall back to in-memory sessions.
async function createSessionStore(dbConnected) {
  if (!dbConnected) return undefined;
  try {
    const { default: MongoStore } = await import("connect-mongo");
    return MongoStore.create({
      mongoUrl: process.env.MONGO_URL,
      collectionName: "sessions",
      ttl: 7 * 24 * 60 * 60, // seconds
    });
  } catch (error) {
    console.log(
      `⚠️  Persistent sessions unavailable (${error.message}). Using in-memory sessions. ` +
        "Run `npm install` in the project root to enable connect-mongo."
    );
    return undefined;
  }
}

async function start() {
  const dbConnected = await connectMongoDB();
  const store = await createSessionStore(dbConnected);

  // Behind a proxy (Render, Railway, ...) so secure cookies work over HTTPS
  if (process.env.NODE_ENV === "production") {
    app.set("trust proxy", 1);
  }

  // Never let the browser cache API answers (e.g. a stale "logged out" /auth/check)
  app.use("/api", (req, res, next) => {
    res.set("Cache-Control", "no-store");
    next();
  });

  app.use(
    session({
      name: SESSION_COOKIE,
      secret: process.env.SESSION_SECRET || "dev-secret-change-me",
      resave: false,
      saveUninitialized: false,
      store,
      cookie: {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.COOKIE_SECURE === "true", // set true when served over HTTPS
        maxAge: 1000 * 60 * 60 * 24 * 7,
      },
    })
  );
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(cors({ origin: CLIENT_URL, credentials: true }));
  app.use(express.json());

  // API routes
  app.use("/api/auth", authRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/explore", exploreRoutes);
  app.use("/api/repos", repoRoutes);

  // Unknown API paths get JSON instead of an HTML error page
  app.use("/api", (req, res) => {
    res.status(404).json({ error: "API route not found" });
  });

  // Serve frontend in production
  if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../frontend/dist")));

    app.get("*", (req, res) => {
      res.sendFile(path.resolve(__dirname, "../frontend/dist", "index.html"));
    });
  } else {
    app.get("/", (req, res) => {
      res.send("API running in development mode...");
    });
  }

  // Last-resort error handler: never leak stack traces or hang the request
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    console.error("Unhandled error:", err);
    if (res.headersSent) return next(err);
    res.status(500).json({ error: "Internal server error" });
  });

  const server = app.listen(PORT, () => {
    console.log(`Server started on http://localhost:${PORT}`);
    if (!process.env.GITHUB_API_KEY) {
      console.log("   Tip: set GITHUB_API_KEY in .env to avoid GitHub's 60 requests/hour limit.");
    }
  });

  server.on("error", (error) => {
    if (error.code === "EADDRINUSE") {
      console.error(`Port ${PORT} is already in use. Stop the other process or change PORT in .env.`);
    } else {
      console.error("Server error:", error.message);
    }
    process.exit(1);
  });
}

start();
