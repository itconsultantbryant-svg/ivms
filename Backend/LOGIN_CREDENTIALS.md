# Backend – Login credentials

The app uses **Node.js**, **Sequelize**, and either **SQLite** or **PostgreSQL**.

## Default login (created on first run)

| Field    | Value              |
|----------|--------------------|
| **Email**    | `admin@example.com` |
| **Password** | `admin123`          |

Use these to sign in at the frontend login page.

## Database

- **SQLite (default):** Set `USE_SQLITE=1` when starting. Data is stored in `Backend/database.sqlite`.
- **PostgreSQL:** Set `DATABASE_URL=postgres://user:password@host:5432/dbname` and start without `USE_SQLITE`.

Start backend: `npm run serverStart`  
With SQLite: `USE_SQLITE=1 npm run serverStart`
