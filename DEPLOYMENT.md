# Deploying with Backend on Render and Frontend on Vercel

This app has a **Node/Express backend** and a **React (CRA) frontend**.

- Deploy the **backend** to Render (Web Service + PostgreSQL).
- Deploy the **frontend** to Vercel (static React build).
- Keep the same Render Postgres instance attached to the backend so no data is lost.

## 1) Deploy Backend on Render

1. Push this repo to GitHub/GitLab and connect it to [Render](https://render.com).
2. Create Render PostgreSQL (or reuse your existing production database).
3. Create a **Web Service** from this repo with **Root Directory** = `Backend`.
4. Set:
   - Build command: `npm install`
   - Start command: `npm start`
5. Add backend environment variables:
   - `DATABASE_URL` = Render Postgres connection string
   - `NODE_ENV` = `production`
   - `DB_SYNC_ALTER` = `0` (recommended for production safety)
   - `FRONTEND_URL` = your Vercel app URL(s), comma-separated if multiple  
     Example: `https://inventory-app.vercel.app,https://inventory-app-git-main-yourteam.vercel.app`

### Database safety notes (important)

- The backend no longer auto-alters schema in production unless `DB_SYNC_ALTER=1`.
- Recommended for production: keep `DB_SYNC_ALTER=0` and apply schema changes with controlled migrations/manual SQL.
- Never switch `DATABASE_URL` to a new empty DB unless you intend to start fresh data.
- Before major deploys, take a Render Postgres backup/snapshot.

Local dev with SQLite (no Postgres):

```bash
cd Backend
USE_SQLITE=1 npm start
```

## 2) Deploy Frontend on Vercel

1. In Vercel, import this repository.
2. Set **Root Directory** to `Frontend`.
3. Framework preset: `Create React App`.
4. Add environment variable (Production + Preview):
   - `REACT_APP_API_URL` = `https://your-render-backend.onrender.com/api`
5. Deploy.

After changing `REACT_APP_API_URL`, redeploy so the new build picks it up.

## Environment reference

| Variable | Where | Description |
|----------|--------|-------------|
| `PORT` | Backend | Set by Render; server uses `process.env.PORT \|\| 4000`. |
| `DATABASE_URL` | Backend | Postgres connection string (Render provides when you attach a DB). |
| `USE_SQLITE` | Backend | Set to `1` for local SQLite; leave unset on Render. |
| `FRONTEND_URL` | Backend | Vercel frontend origin(s), comma-separated for CORS allow-list. |
| `DB_SYNC_ALTER` | Backend | `0` (safe default on production) or `1` (allow Sequelize alter sync). |
| `REACT_APP_API_URL` | Frontend (Vercel) | Backend API base URL (e.g. `https://inventory-api.onrender.com/api`). |

## Default login

After the first deploy, the backend creates an admin user if the database is empty:

- **Email:** `admin@example.com`  
- **Password:** `admin123`  

Change this in production.
