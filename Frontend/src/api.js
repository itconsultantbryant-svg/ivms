/**
 * API base URL for backend. Set REACT_APP_API_URL in production (e.g. on Render).
 * No trailing slash; endpoints are appended (e.g. API_BASE + "/login").
 */
const explicitApi = process.env.REACT_APP_API_URL;

const inferRenderApiBase = () => {
  if (typeof window === "undefined") return null;
  const host = window.location.hostname || "";
  if (!host.endsWith(".onrender.com")) return null;

  // Example: inventory-frontend-2ntj.onrender.com -> inventory-api-2ntj.onrender.com
  const apiHost = host
    .replace("-frontend-", "-api-")
    .replace("-frontend.", "-api.")
    .replace("frontend-", "api-");

  if (apiHost === host) return null;
  return `https://${apiHost}/api`;
};

const inferredRenderApi = inferRenderApiBase();

export const API_BASE =
  explicitApi ||
  inferredRenderApi ||
  (process.env.NODE_ENV === "production"
    ? "https://inventory-api.onrender.com/api"
    : "http://localhost:4000/api");
