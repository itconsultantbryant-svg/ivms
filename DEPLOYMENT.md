# Deploying to Render

This app has a **Node/Express backend** and a **React (CRA) frontend**. On Render you deploy:

1. **Backend** as a Web Service (Node) with a PostgreSQL database.
2. **Frontend** as a Static Site, pointing at the backend API.

## Option A: Deploy with Blueprint (recommended)

1. Push this repo to GitHub/GitLab and connect it to [Render](https://render.com).
2. In the Render dashboard, create a **New** → **Blueprint** and connect the repo.
3. Render will read `render.yaml` and create:
   - A Postgres database (`inventory-db`)
   - Backend web service (`inventory-api`)
   - Static site (`inventory-frontend`)
4. **Required after first deploy:**
   - Open the **inventory-frontend** service → **Environment**.
   - Add: `REACT_APP_API_URL` = `https://inventory-api.onrender.com/api`  
     (use your actual backend URL; no trailing slash).
   - **Redeploy** the frontend so the build uses this variable.
   - Optionally on **inventory-api**, set `FRONTEND_URL` to your frontend URL (e.g. `https://inventory-frontend.onrender.com`) for CORS.

## Option B: Manual setup

### Backend (Web Service)

1. **New** → **Web Service**. Connect the repo, set **Root Directory** to `Backend`.
2. **Build**: `npm install`  
   **Start**: `npm start`
3. **Environment**:
   - Add a **PostgreSQL** database (Render → New → PostgreSQL), then in the service add:
     - `DATABASE_URL` = (from the database’s **Internal Database URL**)
   - `NODE_ENV` = `production`
   - Optional: `FRONTEND_URL` = your frontend URL (e.g. `https://your-frontend.onrender.com`) for CORS.
   - Schema updates: the backend uses `sequelize.sync({ alter: true })` by default so new columns (product barcode, category thresholds, etc.) are applied automatically. If you prefer to manage migrations yourself, set **`DB_SYNC_ALTER=0`** on the API service (then run SQL migrations manually).

Local dev with SQLite (no Postgres):

```bash
cd Backend
USE_SQLITE=1 npm start
```

### Frontend (Static Site)

1. **New** → **Static Site**. Connect the same repo, set **Root Directory** to `Frontend`.
2. **Build**: `npm install && npm run build`  
   **Publish directory**: `build`
3. **Environment** (must be set before build):
   - `REACT_APP_API_URL` = `https://your-backend.onrender.com/api`  
     Replace with your real backend URL; no trailing slash.

After changing `REACT_APP_API_URL`, trigger a new deploy so the build runs again.

## Environment reference

| Variable | Where | Description |
|----------|--------|-------------|
| `PORT` | Backend | Set by Render; server uses `process.env.PORT \|\| 4000`. |
| `DATABASE_URL` | Backend | Postgres connection string (Render provides when you attach a DB). |
| `USE_SQLITE` | Backend | Set to `1` for local SQLite; leave unset on Render. |
| `FRONTEND_URL` | Backend | Optional; frontend origin for CORS. |
| `REACT_APP_API_URL` | Frontend | Backend API base URL (e.g. `https://inventory-api.onrender.com/api`). |

## Default login

After the first deploy, the backend creates an admin user if the database is empty:

- **Email:** `admin@example.com`  
- **Password:** `admin123`  

Change this in production.
