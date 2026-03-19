import React, { createContext, useContext, useEffect, useState } from "react";

/** Dispatched after route changes or mutations so lists can refetch without waiting for the next poll. */
export const LIVE_REFRESH_EVENT = "inventory:live-refresh";

export function emitLiveRefresh() {
  window.dispatchEvent(new Event(LIVE_REFRESH_EVENT));
}

const DEFAULT_MS = 30000;

const LiveRefreshContext = createContext(0);

/**
 * One shared tick for the whole app (single interval + focus/visibility),
 * so every consumer stays in sync without N duplicate timers.
 */
export function LiveRefreshProvider({ children, intervalMs = DEFAULT_MS }) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const bump = () => setTick((t) => t + 1);
    const id = setInterval(bump, intervalMs);
    const onVis = () => {
      if (document.visibilityState === "visible") bump();
    };
    window.addEventListener("focus", bump);
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener(LIVE_REFRESH_EVENT, bump);
    return () => {
      clearInterval(id);
      window.removeEventListener("focus", bump);
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener(LIVE_REFRESH_EVENT, bump);
    };
  }, [intervalMs]);

  return <LiveRefreshContext.Provider value={tick}>{children}</LiveRefreshContext.Provider>;
}

/** Returns a counter that increments on interval, focus, visibility, route change (via emit), and custom events. */
export function useLiveRefresh() {
  return useContext(LiveRefreshContext);
}
