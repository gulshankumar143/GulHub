// Full-page redirect to the backend, which forwards to GitHub's login screen
export const handleLoginWithGithub = () => {
  window.location.assign("/api/auth/github");
};
