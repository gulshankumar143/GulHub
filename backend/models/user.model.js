import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      default: "",
    },
    profileUrl: {
      type: String,
      required: true,
    },
    avatarUrl: {
      type: String,
    },
    likedProfiles: {
      type: [String],
      default: [],
    },
    likedBy: [
      {
        username: {
          type: String,
          required: true,
        },
        avatarUrl: {
          type: String,
        },
        likedDate: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    bookmarks: {
      type: [
        {
          _id: false,
          repoId: { type: Number, required: true },
          name: { type: String, required: true },
          ownerLogin: { type: String, required: true },
          description: { type: String, default: "" },
          htmlUrl: { type: String, default: "" },
          language: { type: String, default: "" },
          stars: { type: Number, default: 0 },
          forks: { type: Number, default: 0 },
          addedAt: { type: Date, default: Date.now },
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
