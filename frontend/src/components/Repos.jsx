import { useEffect, useRef, useState } from "react";
import Repo from "./Repo";

const PAGE_SIZE = 10;

// Renders repos in chunks of 10 and loads more when you scroll to the bottom.
const Repos = ({ repos, alwaysFullWidth = false }) => {
  const className = alwaysFullWidth ? "w-full" : "lg:w-2/3 w-full";
  const [visible, setVisible] = useState(PAGE_SIZE);
  const sentinelRef = useRef(null);

  // Start again from the first page whenever the list changes (sort / filter / new user)
  useEffect(() => {
    setVisible(PAGE_SIZE);
  }, [repos]);

  const hasMore = visible < repos.length;

  useEffect(() => {
    if (!hasMore) return;
    const node = sentinelRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) setVisible((v) => v + PAGE_SIZE);
      },
      { rootMargin: "300px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, visible]);

  return (
    <div className={`${className} bg-glass rounded-lg px-8 py-6`}>
      <ol className="relative border-s timeline-line">
        {repos.slice(0, visible).map((repo) => (
          <Repo key={repo.id} repo={repo} />
        ))}
        {repos.length === 0 && (
          <p className="flex items-center justify-center h-32">No repos found</p>
        )}
      </ol>

      {hasMore && (
        <div ref={sentinelRef} className="text-center pt-2">
          <button
            type="button"
            className="bg-glass rounded-lg px-4 py-2 text-sm"
            onClick={() => setVisible((v) => v + PAGE_SIZE)}
          >
            Load more ({repos.length - visible} left)
          </button>
        </div>
      )}
    </div>
  );
};

export default Repos;
