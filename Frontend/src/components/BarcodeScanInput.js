import { useRef, useCallback } from "react";

/**
 * USB / keyboard-wedge scanners: rapid digits then Enter.
 * Uses currentTarget.value on Enter so React state is not stale.
 * Also commits on Tab; optional idle timeout for scanners that omit Enter.
 */
export default function BarcodeScanInput({ value, onChange, onCommit, placeholder, className = "" }) {
  const ref = useRef(null);
  const lastKeyAt = useRef(0);
  const idleTimer = useRef(null);

  const commit = useCallback(
    (raw) => {
      const v = String(raw ?? "").trim();
      if (v) onCommit?.(v);
    },
    [onCommit]
  );

  const flushIdle = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const v = el.value.trim();
    const digits = v.replace(/\D/g, "");
    // Only auto-commit long numeric reads (typical retail barcode), not short manual codes
    if (digits.length >= 8 && /^\d+$/.test(digits)) {
      commit(digits);
    }
  }, [commit]);

  return (
    <input
      ref={ref}
      type="text"
      inputMode="numeric"
      autoComplete="off"
      spellCheck={false}
      value={value}
      onChange={(e) => {
        onChange(e.target.value);
        const now = Date.now();
        const delta = now - lastKeyAt.current;
        lastKeyAt.current = now;
        if (idleTimer.current) clearTimeout(idleTimer.current);
        // Fast typing (scanner wedge): auto-commit shortly after last character
        if (delta < 45 && e.target.value.length >= 6) {
          idleTimer.current = setTimeout(flushIdle, 85);
        }
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          if (idleTimer.current) clearTimeout(idleTimer.current);
          commit(e.currentTarget.value);
          return;
        }
        if (e.key === "Tab" && !e.shiftKey) {
          e.preventDefault();
          if (idleTimer.current) clearTimeout(idleTimer.current);
          commit(e.currentTarget.value);
        }
      }}
      onPaste={(e) => {
        const t = e.clipboardData.getData("text").trim();
        if (t) {
          e.preventDefault();
          onChange(t);
          setTimeout(() => commit(t), 0);
        }
      }}
      placeholder={placeholder || "Scan barcode — auto-detect or press Enter"}
      className={`rounded-lg border border-gray-300 px-3 py-2 text-sm w-full ${className}`}
    />
  );
}
