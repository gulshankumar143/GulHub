# GulHub

GulHub is a GitHub-focused social and discovery app that lets users search GitHub profiles, explore public repositories, compare accounts, and interact with repository activity through a clean React frontend and Express backend.

## Overview

This project combines GitHub profile discovery with light social features such as likes, bookmarks, and leaderboards. It is built to feel like a mini GitHub explorer and profile dashboard for developers.

## Features

- Search GitHub users with debounced suggestions and shareable profile URLs
- View a user's public repositories with pagination/infinite scroll, sorting, filters, and language-based searching
- Inspect repository details, topics, contributors, and recent commit activity
- Compare two GitHub profiles side by side
- Explore popular repositories by language
- Sign in with GitHub OAuth
- Like/unlike profiles and view personalized liked-by-me pages
- Bookmark repositories and track leaderboard activity
- Use a light/dark theme with responsive mobile-friendly navigation
- Persist sessions in MongoDB so users stay logged in across backend restarts

## Tech Stack

- Backend: Node.js, Express, Passport.js, GitHub OAuth, Mongoose, MongoDB
- Frontend: React, Vite, Tailwind CSS
- Session storage: connect-mongo

## Prerequisites

Before running the app, make sure you have:

- Node.js 18+ and npm
- A MongoDB instance or MongoDB Atlas cluster
- A GitHub OAuth app configured for local development

## Getting Started

1. Clone the repository:

```bash
git clone https://github.com/gulshankumar143/GulHub.git
cd GulHub
```

2. Install backend dependencies:

```bash
npm install
```

3. Install frontend dependencies:

```bash
npm install --prefix frontend
```

4. Create a local environment file from the example:

```bash
copy .env.example
```

5. Fill in the required values in `.env`:

```env
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_CALLBACK_URL=http://localhost:5000/api/auth/github/callback
MONGO_URL=mongodb_URL
CLIENT_BASE_URL=http://localhost:3000
SESSION_SECRET=change_me_to_a_long_random_string
PORT=5000
NODE_ENV=development
```

Optional values:

```env
GITHUB_API_KEY=your_github_api_key
COOKIE_SECURE=false
```


## Project Structure

```text
GulHub/
├── backend/
│   ├── config.js
│   ├── server.js
│   ├── controllers/
│   ├── db/
│   ├── middleware/
│   ├── models/
│   ├── passport/
│   ├── routes/
│   └── utils/
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
├── .env.example
├── package.json
├── README.md
```

## Troubleshooting

| Symptom | Fix |
|---|---|
| `localhost refused to connect` after GitHub login | Open the app at `http://localhost:3000` and make sure `CLIENT_BASE_URL=http://localhost:3000` is set in `.env`. |
| Login redirects back to `/login` with a red message | Check whether `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, callback URL, and MongoDB connectivity are all correct. |
| "The database is not connected" | Verify `MONGO_URL` and ensure your MongoDB IP is allowed in Atlas network access. |
| GitHub OAuth `redirect_uri` mismatch | The callback URL must match: `http://localhost:5000/api/auth/github/callback` |
| "GitHub API rate limit reached" | Add `GITHUB_API_KEY` to `.env` to raise the limit from 60 to 5000 requests/hour. Restart the backend afterward. |
| Browser session is not preserved after login | Clear cookies for `localhost` or use an incognito window. The app uses a dedicated session cookie name (`gulhub.sid`) to avoid conflicts. |
| "Cannot reach the server" toast | Make sure the backend is running with `npm run dev` from the project root. |
| `Cannot find package 'connect-mongo'` warning | Run `npm install` in the project root to install the backend dependencies. |

## License

This project is currently licensed under the ISC license unless otherwise noted.
