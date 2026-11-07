import { useState } from "react";
import { Link } from "react-router-dom";
import { FaEye } from "react-icons/fa";
import { IoLocationOutline } from "react-icons/io5";
import { TfiThought } from "react-icons/tfi";
import { FaXTwitter } from "react-icons/fa6";
import { MdCompareArrows } from "react-icons/md";
import {
  RiGitRepositoryFill,
  RiUserFollowFill,
  RiUserFollowLine,
} from "react-icons/ri";
import { formatMemberSince } from "../utils/funtions";
import { LikeProfile } from "./LikeProfile";
import FollowListModal from "./FollowListModal";

const ProfileInfo = ({ userProfile }) => {
  const [followList, setFollowList] = useState(null); // "followers" | "following" | null

  const memberSince = formatMemberSince(userProfile?.created_at);
  const bio = userProfile?.bio || "";

  const statBox = "flex items-center gap-2 bg-glass rounded-lg p-2 flex-1 min-w-24";

  return (
    <div className="lg:w-1/3 w-full flex flex-col gap-2 lg:sticky md:top-10">
      <div className="bg-glass rounded-lg p-4">
        <div className="flex gap-3 items-center">
          {/* User Avtar */}
          <a
            href={userProfile?.html_url}
            target="_blank"
            rel="noreferrer"
            className="rounded-xl w-24 h-24 mb-2 shrink-0 avatar-ring"
          >
            <img
              src={userProfile?.avatar_url}
              className="rounded-xl w-24 h-24 mb-2"
              alt=""
            ></img>
          </a>
          <div className="flex gap-2 items-center flex-col flex-1">
            <LikeProfile userProfile={userProfile} />
            <a
              href={userProfile?.html_url}
              target="_blank"
              rel="noreferrer"
              className="bg-glass font-medium w-full text-xs p-2 rounded-md cursor-pointer border border-accent flex items-center gap-2"
            >
              <FaEye size={16} />
              View on Github
            </a>
            <Link
              to={`/compare?a=${encodeURIComponent(userProfile?.login || "")}`}
              className="bg-glass font-medium w-full text-xs p-2 rounded-md border flex items-center gap-2"
            >
              <MdCompareArrows size={16} />
              Compare
            </Link>
          </div>
        </div>

        {/* User Bio */}
        {bio ? (
          <div className="flex items-center gap-2">
            <TfiThought className="shrink-0" />
            <p className="text-sm">
              {bio.length > 60 ? `${bio.substring(0, 60)}...` : bio}
            </p>
          </div>
        ) : null}

        {/* Location */}
        {userProfile?.location ? (
          <div className="flex items-center gap-2">
            <IoLocationOutline />
            {userProfile?.location}
          </div>
        ) : null}

        {/* Twitter Username */}
        {userProfile?.twitter_username ? (
          <a
            href={`https://twitter.com/${userProfile.twitter_username}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 hover:text-accent"
          >
            <FaXTwitter />
            {userProfile?.twitter_username}
          </a>
        ) : null}

        {/* Member Since Date */}
        <div className="my-2">
          <p className="text-gray-600 font-bold text-sm">Member since</p>
          <p>{memberSince}</p>
        </div>

        {/* Email Address */}
        {userProfile?.email && (
          <div className="my-2">
            <p className="text-gray-600 font-bold text-sm">Email address</p>
            <p>{userProfile.email}</p>
          </div>
        )}

        {/* Full Name */}
        {userProfile?.name && (
          <div className="my-2">
            <p className="text-gray-600 font-bold text-sm">Full name</p>
            <p>{userProfile?.name}</p>
          </div>
        )}

        {/* Username */}
        <div className="my-2">
          <p className="text-gray-600 font-bold text-sm">Username</p>
          <p>{userProfile?.login}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mx-4">
        {/* Followers: click to see the list */}
        <button
          type="button"
          className={`${statBox} text-left`}
          disabled={!userProfile?.followers}
          onClick={() => setFollowList("followers")}
          title="Show followers"
        >
          <RiUserFollowFill className="w-5 h-5 text-accent" />
          <p className="text-xs">Followers: {userProfile?.followers}</p>
        </button>

        {/* Following: click to see the list */}
        <button
          type="button"
          className={`${statBox} text-left`}
          disabled={!userProfile?.following}
          onClick={() => setFollowList("following")}
          title="Show following"
        >
          <RiUserFollowLine className="w-5 h-5 text-accent" />
          <p className="text-xs">Following: {userProfile?.following}</p>
        </button>

        {/* Number of public repos */}
        <div className={statBox}>
          <RiGitRepositoryFill className="w-5 h-5 text-accent" />
          <p className="text-xs">Public repos: {userProfile?.public_repos}</p>
        </div>

        {/* Number of public gists */}
        <div className={statBox}>
          <RiGitRepositoryFill className="w-5 h-5 text-accent" />
          <p className="text-xs">Public gists: {userProfile?.public_gists}</p>
        </div>
      </div>

      {followList && (
        <FollowListModal
          username={userProfile.login}
          type={followList}
          onClose={() => setFollowList(null)}
        />
      )}
    </div>
  );
};

export default ProfileInfo;
