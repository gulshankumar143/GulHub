import User from "../models/user.model.js";

const MAX_BOOKMARKS = 200;

const sanitize = (body) => {
  const repoId = Number(body?.id);
  const name = String(body?.name || "").slice(0, 100);
  const ownerLogin = String(body?.owner?.login || "").slice(0, 100);

  if (!Number.isInteger(repoId) || repoId <= 0 || !name || !ownerLogin) return null;

  return {
    repoId,
    name,
    ownerLogin,
    description: String(body?.description || "").slice(0, 500),
    htmlUrl: `https://github.com/${ownerLogin}/${name}`,
    language: String(body?.language || "").slice(0, 50),
    stars: Number(body?.stargazers_count) || 0,
    forks: Number(body?.forks_count) || 0,
    addedAt: new Date(),
  };
};

const currentBookmarks = async (userId) => {
  const user = await User.findById(userId).select("bookmarks");
  return user?.bookmarks || [];
};

export const getBookmarks = async (req, res) => {
  try {
    const bookmarks = await currentBookmarks(req.user._id);
    return res.status(200).json({ bookmarks });
  } catch (error) {
    console.error("Get bookmarks error:", error);
    return res.status(500).json({ error: "Unable to load bookmarks" });
  }
};

export const addBookmark = async (req, res) => {
  try {
    const item = sanitize(req.body);
    if (!item) return res.status(400).json({ error: "Invalid repository data" });

    const existing = await currentBookmarks(req.user._id);
    if (existing.length >= MAX_BOOKMARKS) {
      return res.status(400).json({ error: `You can save up to ${MAX_BOOKMARKS} bookmarks` });
    }

    // $ne guard makes the insert atomic and prevents duplicates
    await User.updateOne(
      { _id: req.user._id, "bookmarks.repoId": { $ne: item.repoId } },
      { $push: { bookmarks: item } }
    );

    return res.status(200).json({
      message: "Repository bookmarked",
      bookmarks: await currentBookmarks(req.user._id),
    });
  } catch (error) {
    console.error("Add bookmark error:", error);
    return res.status(500).json({ error: "Unable to save bookmark" });
  }
};

export const removeBookmark = async (req, res) => {
  try {
    const repoId = Number(req.params.repoId);
    if (!Number.isInteger(repoId)) {
      return res.status(400).json({ error: "Invalid repository id" });
    }

    await User.updateOne({ _id: req.user._id }, { $pull: { bookmarks: { repoId } } });

    return res.status(200).json({
      message: "Bookmark removed",
      bookmarks: await currentBookmarks(req.user._id),
    });
  } catch (error) {
    console.error("Remove bookmark error:", error);
    return res.status(500).json({ error: "Unable to remove bookmark" });
  }
};
