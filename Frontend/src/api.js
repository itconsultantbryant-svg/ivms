/**
 * API base URL for backend. Set REACT_APP_API_URL in production (e.g. Render API URL + /api).
 * No trailing slash; endpoints are appended (e.g. API_BASE + "/login").
 */
const rawApiBase =
  process.env.REACT_APP_API_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://inventory-api.onrender.com/api"
    : "http://localhost:4000/api");

export const API_BASE = rawApiBase.replace(/\/+$/, "");
