/**
 * API base URL for backend. Set REACT_APP_API_URL in production (e.g. on Render).
 * No trailing slash; endpoints are appended (e.g. API_BASE + "/login").
 */
export const API_BASE =
  process.env.REACT_APP_API_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://inventory-api-fk6y.onrender.com/api"
    : "http://localhost:4000/api");
