/**
 * fetch with retries for transient failures (e.g. Render cold start, ERR_CONNECTION_CLOSED).
 */
export async function fetchWithRetry(url, options = {}, { retries = 2, retryDelayMs = 800 } = {}) {
  let lastErr;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, options);
      return res;
    } catch (e) {
      lastErr = e;
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, retryDelayMs * (attempt + 1)));
      }
    }
  }
  throw lastErr;
}
