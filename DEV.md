Local Development

- Requirements
  - Node.js 18+ (uses `node --watch`)
  - MongoDB connection string in `.env` at repo root or `backend/.env` with `MONGO_URI` or `MONGODB_URI` and optional `DB_NAME`.

- Windows PowerShell users: Unblock npm without changing policy
  - Run once: `scripts\fix-npm-alias.cmd`
  - Close and reopen PowerShell. From now on, `npm` will use `npm.cmd` (no ps1 policy needed).

- Install and run
  - `npm install`
  - `npm --prefix backend install`
  - `npm run dev:all` (starts backend and frontend proxy with live reload)

- One-command Windows start (installs first time)
  - `dev.bat`

- Health checks
  - Backend: `GET http://localhost:4000/api/health`
  - Frontend: `GET http://localhost:3000/health`
  - DB ping: `node db-ping.js` or `npm run mongo:ping`

