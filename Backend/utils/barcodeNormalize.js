/**
 * Build a list of string variants to match against stored barcodes.
 * Retail scanners often differ: EAN-13 vs UPC-A (leading 0), spaces, checksum-only reads.
 */
function barcodeLookupVariants(raw) {
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

    // UPC-E expansion sometimes differs — try common paddings
    for (const len of [8, 12, 13, 14]) {
      if (digitsOnly.length < len) {
        add(digitsOnly.padStart(len, "0"));
      }
    }
    // EAN-13 often stored with leading 0 from UPC-A
    if (digitsOnly.length === 12) {
      add("0" + digitsOnly);
    }
    if (digitsOnly.length === 13 && digitsOnly.startsWith("0")) {
      add(digitsOnly.slice(1));
    }
  }

  return [...set];
}

/**
 * True if two barcode strings refer to the same item (overlapping variant sets).
 */
function barcodesFuzzyMatch(stored, scanned) {
  const A = new Set(barcodeLookupVariants(stored));
  const B = new Set(barcodeLookupVariants(scanned));
  for (const x of A) {
    if (B.has(x)) return true;
  }
  return false;
}

/**
 * Normalize barcode for storage (single canonical form for new saves).
 * Prefer digits-only for typical retail codes (8+ digits).
 */
function normalizeBarcodeForStorage(raw) {
  if (raw == null || String(raw).trim() === "") return null;
  const digits = String(raw).replace(/\D/g, "");
  if (digits.length >= 8) {
    return digits;
  }
  const t = String(raw).trim().replace(/\s+/g, "");
  return t || null;
}

module.exports = { barcodeLookupVariants, normalizeBarcodeForStorage, barcodesFuzzyMatch };
