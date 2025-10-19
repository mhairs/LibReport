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
  - DB ping: `npm run mongo:ping`

- MongoDB connection tips
  - Prefer copying the full connection string from MongoDB Atlas/Compass into `.env` as `MONGO_URI=` (or `MONGODB_URI=`).
  - If your DB user password has special characters (e.g., `@` or `!`), URL-encode it or use the string Compass provides.
  - If your user is created in the `admin` database, add `?authSource=admin` to your URI.
  - For self-managed/non-SRV hosts, you can also use parts instead of a URI:
    - `MONGO_HOST=localhost`, `MONGO_PORT=27017`, `MONGO_DB=libreport`, optionally `MONGO_USER`, `MONGO_PASS`, `MONGO_AUTH_DB=admin`.
