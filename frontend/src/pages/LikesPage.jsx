import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaHeart } from "react-icons/fa";
import toast from "react-hot-toast";
import Spinner from "../components/Spinner";
import { useAuthContext } from "../../context/AuthContext";
import { apiFetch } from "../utils/api";

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString();
};

const TABS = [
  { id: "received", label: "Received" },
  { id: "given", label: "Given" },
];

const LikesPage = () => {
  const { setAuthUser } = useAuthContext();
  const [tab, setTab] = useState("received");
  const [received, setReceived] = useState([]);
  const [given, setGiven] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    const load = async () => {
      setLoading(true);
      try {
        const [rec, giv] = await Promise.all([
          apiFetch("/api/users/likes", { signal: controller.signal }),
          apiFetch("/api/users/likes/given", { signal: controller.signal }),
        ]);
        setReceived(rec.likedBy || []);
        setGiven(giv.likedProfiles || []);
      } catch (error) {
        if (error.name !== "AbortError") toast.error(error.message);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    load();
    return () => controller.abort();
  }, []);

  const unlike = useCallback(
    async (username) => {
      try {
        const data = await apiFetch(`/api/users/like/${username}`, { method: "DELETE" });
        setGiven((prev) => prev.filter((u) => u.username !== username));
        setAuthUser((prev) => (prev ? { ...prev, likedProfiles: data.likedProfiles } : prev));
        toast.success(data.message);
      } catch (error) {
        toast.error(error.message);
      }
    },
    [setAuthUser]
  );

  const rows = tab === "received" ? received : given;

  return (
    <div className="px-4">
      <div className="flex justify-center gap-2 mb-4">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`py-2 px-5 text-sm font-medium rounded-lg bg-glass ${
              tab === t.id ? "border-accent" : ""
            }`}
          >
            {t.label} ({t.id === "received" ? received.length : given.length})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : (
        <div className="relative overflow-x-auto shadow-md rounded-lg">
          <table className="w-full text-sm text-left rtl:text-right bg-glass overflow-hidden">
            <thead className="text-xs uppercase bg-glass">
              <tr>
                <th scope="col" className="p-4">No</th>
                <th scope="col" className="px-6 py-3">Username</th>
                {tab === "received" && <th scope="col" className="px-6 py-3">Date</th>}
                <th scope="col" className="px-6 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((user, idx) => (
                <tr className="bg-glass border-b" key={user?.username}>
                  <td className="w-4 p-4">{idx + 1}</td>
                  <th scope="row" className="px-6 py-4 whitespace-nowrap">
                    <Link to={`/user/${user?.username}`} className="flex items-center hover:underline">
                      <img className="w-10 h-10 rounded-full" src={user?.avatarUrl} alt="User Avatar" />
                      <div className="ps-3 text-base font-semibold">{user?.username}</div>
                    </Link>
                  </th>
                  {tab === "received" && (
                    <td className="px-6 py-4">{formatDate(user?.likedDate)}</td>
                  )}
                  <td className="px-6 py-4">
                    {tab === "received" ? (
                      <div className="flex items-center">
                        <FaHeart size={22} className="text-rose-500 mx-2" />
                        Liked your profile
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => unlike(user.username)}
                        className="bg-glass border border-rose-400 rounded-md px-3 py-1 text-xs font-medium"
                      >
                        Unlike
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {rows.length === 0 && (
            <p className="text-center text-gray-500 py-8">
              {tab === "received"
                ? "Nobody has liked your profile yet."
                : "You haven't liked any profiles yet."}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default LikesPage;
