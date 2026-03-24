/**
 * Client-side variants (keep in sync with Backend/utils/barcodeNormalize.js) for display / hints.
 */
export function barcodeLookupVariants(raw) {
  const t = String(raw ?? "")
    .trim()
    .replace(/[\u0000-\u001F\u007F]/g, "");
  if (!t) return [];

  const noSpace = t.replace(/\s/g, "");
  const digitsOnly = noSpace.replace(/\D/g, "");

  const set = new Set();
  const add = (s) => {
    if (s != null && s !== "") set.add(String(s));
  };

  add(t);
  add(noSpace);
  add(digitsOnly);

  if (digitsOnly.length > 0) {
    const stripped = digitsOnly.replace(/^0+/, "") || "0";
    add(stripped);
    for (const len of [8, 12, 13, 14]) {
      if (digitsOnly.length < len) {
        add(digitsOnly.padStart(len, "0"));
      }
    }
    if (digitsOnly.length === 12) {
      add("0" + digitsOnly);
    }
    if (digitsOnly.length === 13 && digitsOnly.startsWith("0")) {
      add(digitsOnly.slice(1));
    }
  }

  return [...set];
}
