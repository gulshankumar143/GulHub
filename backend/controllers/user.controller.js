import User from "../models/user.model.js";
import {
  githubRequest,
  hasNextPage,
  sendError,
  toGithubError,
} from "../utils/github.js";
import { cached } from "../utils/cache.js";

const USERNAME_RE = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,38})$/;
const MAX_REPO_PAGES = 10; // 10 x 100 = up to 1000 repos per user
const FIVE_MINUTES = 5 * 60 * 1000;

// ---------- GitHub profile + ALL public repos (up to 1000) ----------
export const getUserProfileAndRepos = async (req, res) => {
  const username = req.params.username?.trim();

  if (!username || !USERNAME_RE.test(username)) {
    return res.status(400).json({ error: "Please enter a valid GitHub username" });
  }

  try {
    const data = await cached(
      `profile:${username.toLowerCase()}`,
      FIVE_MINUTES,
      async () => {
        const encoded = encodeURIComponent(username);
        const user = await githubRequest(`/users/${encoded}`);
        if (!user.ok) {
          throw toGithubError(
            user.res,
            user.data,
            `GitHub user "${username}" was not found`
          );
        }

        const userProfile = user.data;
        const total = userProfile.public_repos || 0;
        const pages = Math.min(MAX_REPO_PAGES, Math.ceil(total / 100));

        const results = await Promise.all(
          Array.from({ length: pages }, (_, i) =>
            githubRequest(`/users/${encoded}/repos?per_page=100&sort=updated&page=${i + 1}`)
          )
        );

        const failed = results.find((r) => !r.ok);
        if (failed) {
          throw toGithubError(failed.res, failed.data, "Repositories not found");
        }

        const repos = results.flatMap((r) => (Array.isArray(r.data) ? r.data : []));
        return { userProfile, repos, truncated: total > pages * 100 };
      }
    );

    return res.status(200).json(data);
  } catch (error) {
    return sendError(res, error, "Unable to fetch GitHub profile. Please try again.");
  }
};

// ---------- Followers / following lists (paginated) ----------
const makeFollowList = (type) => async (req, res) => {
  const username = req.params.username?.trim();
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);

  if (!username || !USERNAME_RE.test(username)) {
    return res.status(400).json({ error: "Invalid username" });
  }

  try {
    const { res: ghRes, data, ok } = await githubRequest(
      `/users/${encodeURIComponent(username)}/${type}?per_page=30&page=${page}`
    );
    if (!ok) throw toGithubError(ghRes, data, `GitHub user "${username}" was not found`);

    const users = (Array.isArray(data) ? data : []).map((u) => ({
      login: u.login,
      avatar_url: u.avatar_url,
      html_url: u.html_url,
    }));

    return res.status(200).json({ users, hasMore: hasNextPage(ghRes) });
  } catch (error) {
    return sendError(res, error, `Unable to fetch ${type}`);
  }
};

export const getFollowers = makeFollowList("followers");
export const getFollowing = makeFollowList("following");

// ---------- Search suggestions ----------
export const searchUsers = async (req, res) => {
  const q = String(req.query.q || "").trim();

  if (q.length < 2 || q.length > 39 || !/^[\w-]+$/.test(q)) {
    return res.status(200).json({ users: [] });
  }

  try {
    const users = await cached(`search:${q.toLowerCase()}`, 2 * 60 * 1000, async () => {
      const { res: ghRes, data, ok } = await githubRequest(
        `/search/users?q=${encodeURIComponent(q)}+in:login&per_page=5`
      );
      if (!ok) throw toGithubError(ghRes, data);
      return (data.items || []).map((u) => ({
        login: u.login,
        avatar_url: u.avatar_url,
      }));
    });

    return res.status(200).json({ users });
  } catch (error) {
    return sendError(res, error, "Search failed");
  }
};

// ---------- Likes ----------
export const likeProfile = async (req, res) => {
  try {
    const { username } = req.params;

    if (!username) {
      return res.status(400).json({ error: "Username is required" });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: "Authenticated user not found" });
    }

    const userToLike = await User.findOne({ username });
    if (!userToLike) {
      return res.status(404).json({ error: "This user is not a GulHub member" });
    }

    if (user.username === userToLike.username) {
      return res.status(400).json({ error: "You cannot like your own profile" });
    }

    if (user.likedProfiles.includes(userToLike.username)) {
      return res.status(400).json({ error: "You have already liked this profile" });
    }

    userToLike.likedBy.push({
      username: user.username,
      avatarUrl: user.avatarUrl,
      likedDate: new Date(),
    });
    user.likedProfiles.push(userToLike.username);

    await Promise.all([userToLike.save(), user.save()]);

    return res.status(200).json({
      message: "Profile liked",
      likedProfiles: user.likedProfiles,
    });
  } catch (error) {
    console.error("Like profile error:", error);
    return res.status(500).json({ error: "Unable to like profile" });
  }
};

export const unlikeProfile = async (req, res) => {
  try {
    const { username } = req.params;

    if (!username) {
      return res.status(400).json({ error: "Username is required" });
    }

    await Promise.all([
      User.updateOne({ _id: req.user._id }, { $pull: { likedProfiles: username } }),
      User.updateOne({ username }, { $pull: { likedBy: { username: req.user.username } } }),
    ]);

    const user = await User.findById(req.user._id).select("likedProfiles");

    return res.status(200).json({
      message: "Profile unliked",
      likedProfiles: user?.likedProfiles || [],
    });
  } catch (error) {
    console.error("Unlike profile error:", error);
    return res.status(500).json({ error: "Unable to unlike profile" });
  }
};

// Likes the current user RECEIVED
export const getLikes = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ error: "User not found" });

    return res.status(200).json({ likedBy: user.likedBy || [] });
  } catch (error) {
    console.error("Get likes error:", error);
    return res.status(500).json({ error: "Unable to fetch likes" });
  }
};

// Profiles the current user LIKED
export const getLikedProfiles = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("likedProfiles");
    if (!user) return res.status(404).json({ error: "User not found" });

    const members = await User.find({ username: { $in: user.likedProfiles } }).select(
      "username name avatarUrl"
    );
    const byName = new Map(members.map((m) => [m.username, m]));

    const likedProfiles = user.likedProfiles.map((username) => ({
      username,
      name: byName.get(username)?.name || "",
      avatarUrl: byName.get(username)?.avatarUrl || "",
    }));

    return res.status(200).json({ likedProfiles });
  } catch (error) {
    console.error("Get liked profiles error:", error);
    return res.status(500).json({ error: "Unable to fetch liked profiles" });
  }
};

// ---------- Leaderboard ----------
export const getLeaderboard = async (req, res) => {
  try {
    const leaders = await User.aggregate([
      {
        $project: {
          _id: 0,
          username: 1,
          name: 1,
          avatarUrl: 1,
          likes: { $size: { $ifNull: ["$likedBy", []] } },
        },
      },
      { $sort: { likes: -1, username: 1 } },
      { $limit: 20 },
    ]);

    return res.status(200).json({ leaders });
  } catch (error) {
    console.error("Leaderboard error:", error);
    return res.status(500).json({ error: "Unable to load leaderboard" });
  }
};
