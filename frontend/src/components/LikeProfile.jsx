import { useState } from "react";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import toast from "react-hot-toast";
import { useAuthContext } from "../../context/AuthContext";
import { apiFetch } from "../utils/api";

export const LikeProfile = ({ userProfile }) => {
  const { authUser, setAuthUser } = useAuthContext();
  const [busy, setBusy] = useState(false);

  const isOwnProfile = authUser?.username === userProfile.login;

  if (!authUser || isOwnProfile) {
    return null;
  }

  const liked = (authUser.likedProfiles || []).includes(userProfile.login);

  const handleToggleLike = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const data = await apiFetch(`/api/users/like/${userProfile.login}`, {
        method: liked ? "DELETE" : "POST",
      });

      // Keep the logged-in user in sync so the button flips immediately
      setAuthUser((prev) => (prev ? { ...prev, likedProfiles: data.likedProfiles } : prev));
      toast.success(data.message);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      disabled={busy}
      className={`p-2 text-xs w-full font-medium rounded-md bg-glass border flex items-center gap-2 disabled:opacity-50 ${
        liked ? "border-rose-400" : "border-accent"
      }`}
      onClick={handleToggleLike}
    >
      {liked ? <FaHeart size={16} className="text-rose-500" /> : <FaRegHeart size={16} />}
      {liked ? "Unlike" : "Like Profile"}
    </button>
  );
};
