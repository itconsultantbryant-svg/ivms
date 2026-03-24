import { useState, useRef, useEffect, useCallback } from "react";

/** Broad format list; browser ignores unsupported entries. */
const FORMATS = [
  "qr_code",
  "aztec",
  "code_128",
  "code_39",
  "code_93",
  "codabar",
  "data_matrix",
  "ean_13",
  "ean_8",
  "itf",
  "pdf417",
  "upc_a",
  "upc_e",
];

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
    let intervalId = 0;
    let detector;

    try {
      detector = new BD({ formats: FORMATS });
    } catch {
      try {
        detector = new BD();
      } catch {
        alert("Barcode detection is not supported in this browser.");
        setOn(false);
        return;
      }
    }

    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "environment",
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        const v = videoRef.current;
        if (v) {
          v.srcObject = stream;
          await new Promise((resolve, reject) => {
            v.onloadedmetadata = () => {
              v.play().then(resolve).catch(reject);
            };
          });
        }
        const tick = async () => {
          if (cancelled || !videoRef.current || videoRef.current.readyState < 2) return;
          try {
            const codes = await detector.detect(videoRef.current);
            if (codes.length) {
              const raw = codes[0].rawValue;
              if (raw) {
                onCode(String(raw).trim());
                setOn(false);
              }
            }
          } catch (_) {
            /* frame not ready */
          }
        };
        intervalId = window.setInterval(tick, 120);
      } catch {
        alert("Camera not available. Use manual entry or a USB scanner.");
        setOn(false);
      }
    })();

    return () => {
      cancelled = true;
      if (intervalId) clearInterval(intervalId);
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
          <p className="mb-2 max-w-md text-center text-sm text-white">
            Hold the barcode flat in the frame; keep steady until it reads.
          </p>
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
