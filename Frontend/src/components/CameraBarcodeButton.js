import { useState, useRef, useEffect, useCallback } from "react";

export function CameraBarcodeButton({ onCode, label = "Scan with camera" }) {
  const [on, setOn] = useState(false);
  const videoRef = useRef(null);
  const supported =
    typeof window !== "undefined" && typeof window.BarcodeDetector === "function";

  const stop = useCallback(() => {
    const v = videoRef.current;
    if (v?.srcObject) {
      v.srcObject.getTracks().forEach((t) => t.stop());
      v.srcObject = null;
    }
  }, []);

  useEffect(() => {
    if (!on || !supported) return;
    const BD = window.BarcodeDetector;
    let cancelled = false;
    let raf = 0;
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        const v = videoRef.current;
        if (v) v.srcObject = stream;
        const detector = new BD({
          formats: ["qr_code", "code_128", "ean_13", "ean_8", "code_39", "upc_a", "upc_e"],
        });
        const loop = async () => {
          if (cancelled || !videoRef.current) return;
          try {
            const codes = await detector.detect(videoRef.current);
            if (codes.length) {
              onCode(codes[0].rawValue);
              setOn(false);
              return;
            }
          } catch (_) {
            /* frame not ready */
          }
          raf = requestAnimationFrame(loop);
        };
        raf = requestAnimationFrame(loop);
      } catch {
        alert("Camera not available. Use manual barcode entry or a USB scanner.");
        setOn(false);
      }
    })();
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      stop();
    };
  }, [on, supported, onCode, stop]);

  if (!supported) return null;

  return (
    <>
      <button type="button" className="text-sm text-indigo-600 hover:underline" onClick={() => setOn(true)}>
        {label}
      </button>
      {on && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/85 p-4">
          <video ref={videoRef} autoPlay playsInline muted className="max-h-[70vh] w-full max-w-lg rounded-lg bg-black" />
          <button
            type="button"
            className="mt-4 rounded-lg bg-white px-4 py-2 text-sm font-medium text-gray-900"
            onClick={() => {
              stop();
              setOn(false);
            }}
          >
            Cancel
          </button>
        </div>
      )}
    </>
  );
}
