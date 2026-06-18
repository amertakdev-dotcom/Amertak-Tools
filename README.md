# Amertak Tools — Login/Register with MongoDB

This project adds a simple authentication backend powered by Express, MongoDB, JWT, and cookie-based sessions.

## Setup

1. Install dependencies:

```bash
npm install
```

1. Add environment variables in Render or Vercel:

- `MONGOURL` — your MongoDB connection string
- `JWT_SECRET` — a strong secret for JWT signing
- `NODE_ENV` — `production`

1. Start locally:

```bash
npm start
```

## Endpoints

- `/login` — login page
- `/register` — register page
- `/api/auth/register` — register POST
- `/api/auth/login` — login POST
- `/api/auth/me` — fetch current user
- `/api/auth/logout` — logout POST

## Deployment notes

- Render: use `npm start` and set `PORT` automatically. The Express server is ready to run on Render.
- Vercel: the `/api/auth/*` endpoints will work as serverless functions. Keep `vercel.json` configured to preserve `/api` requests and rewrite other routes to `index.html`.
