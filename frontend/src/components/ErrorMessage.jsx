import { FiAlertTriangle, FiClock, FiUserX } from "react-icons/fi";

// Friendly error panel: "user not found", rate limit, or generic failure.
const ErrorMessage = ({ error, subject, onRetry }) => {
  const notFound = error?.status === 404;
  const rateLimited = error?.rateLimited || error?.status === 429;

  const Icon = rateLimited ? FiClock : notFound ? FiUserX : FiAlertTriangle;
  const title = rateLimited
    ? "GitHub rate limit reached"
    : notFound
    ? `${subject || "That page"} not found`
    : "Something went wrong";

  return (
    <div className="bg-glass rounded-lg p-8 w-full max-w-xl mx-auto text-center flex flex-col items-center gap-3">
      <Icon size={36} className={rateLimited ? "text-yellow-400" : "text-red-400"} />
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="text-sm text-gray-500">{error?.message}</p>
      {rateLimited && (
        <p className="text-xs text-gray-500">
          Tip: add a <code>GITHUB_API_KEY</code> to your <code>.env</code> to raise the limit
          from 60 to 5,000 requests per hour.
        </p>
      )}
      {onRetry && !notFound && (
        <button type="button" onClick={onRetry} className="btn-primary px-4 py-2 text-sm mt-1">
          Try again
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
