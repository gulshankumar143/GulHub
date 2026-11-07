import express from "express";
import {
  getFollowers,
  getFollowing,
  getLeaderboard,
  getLikedProfiles,
  getLikes,
  getUserProfileAndRepos,
  likeProfile,
  searchUsers,
  unlikeProfile,
} from "../controllers/user.controller.js";
import {
  addBookmark,
  getBookmarks,
  removeBookmark,
} from "../controllers/bookmark.controller.js";
import { ensureAuthenticated } from "../middleware/ensureAuthenticated.js";

const router = express.Router();

// Public
router.get("/search", searchUsers);
router.get("/leaderboard", getLeaderboard);
router.get("/profile/:username", getUserProfileAndRepos);
router.get("/profile/:username/followers", getFollowers);
router.get("/profile/:username/following", getFollowing);

// Likes (login required)
router.get("/likes", ensureAuthenticated, getLikes);
router.get("/likes/given", ensureAuthenticated, getLikedProfiles);
router.post("/like/:username", ensureAuthenticated, likeProfile);
router.delete("/like/:username", ensureAuthenticated, unlikeProfile);

// Bookmarks (login required)
router.get("/bookmarks", ensureAuthenticated, getBookmarks);
router.post("/bookmarks", ensureAuthenticated, addBookmark);
router.delete("/bookmarks/:repoId", ensureAuthenticated, removeBookmark);

export default router;
