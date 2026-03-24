import { useRef } from "react";

/** USB / keyboard-wedge scanners usually send digits + Enter. */
export default function BarcodeScanInput({ value, onChange, onCommit, placeholder, className = "" }) {
  const ref = useRef(null);
  return (
    <input
      ref={ref}
      type="text"
      autoComplete="off"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          onCommit?.(String(value || "").trim());
        }
      }}
      placeholder={placeholder || "Scan barcode / QR value, then Enter"}
      className={`rounded-lg border border-gray-300 px-3 py-2 text-sm w-full ${className}`}
    />
  );
}
