<p align="center">
  <h1 align="center">GulHub — GitHub Profile &amp; Repository Explorer</h1>
  <p align="center">Explore GitHub profiles and repositories, compare developers, and save profiles and repos with GulHub, a full-stack app built for the GitHub community.</p>
  <a href="https://nodejs.org/"><img src="https://img.shields.io/badge/Node.js-18%2B-339933?logo=nodedotjs&logoColor=white" alt="Node.js 18 or newer"></a>
  <a href="https://expressjs.com/"><img src="https://img.shields.io/badge/Express.js-Backend-000000?logo=express&logoColor=white" alt="Express.js backend"></a>
  <a href="https://react.dev/"><img src="https://img.shields.io/badge/React-Frontend-61DAFB?logo=react&logoColor=black" alt="React frontend"></a>
  <a href="https://vite.dev/"><img src="https://img.shields.io/badge/Vite-Build-646CFF?logo=vite&logoColor=white" alt="Vite build tool"></a>
  <br>
  <a href="https://www.mongodb.com/"><img src="https://img.shields.io/badge/MongoDB-Database-47A248?logo=mongodb&logoColor=white" alt="MongoDB database"></a>
  <a href="https://github.com/"><img src="https://img.shields.io/badge/GitHub-OAuth-181717?logo=github&logoColor=white" alt="GitHub OAuth"></a>
</p>

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

##

<p align="center">
  <img src="https://img.shields.io/badge/Made%20with-%E2%9D%A4%20Love-ff4d6d?style=for-the-badge" alt="Made with love">
</p>
