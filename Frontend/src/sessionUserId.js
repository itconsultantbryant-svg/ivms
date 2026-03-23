/** Max signed 32-bit int — matches Sequelize INTEGER / PostgreSQL integer. */
export const MAX_DB_INT = 2147483647;

/**
 * Stored sessions may contain timestamp IDs from local fallback; those break FK inserts
 * (PostgreSQL INTEGER / Sequelize INTEGER max is 2^31-1).
 * Out-of-range positive IDs map to 1 (seeded admin). Unparseable values return null.
 */
export function normalizeStoredUserId(raw) {
  if (raw === null || raw === undefined || raw === "") return null;
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 1) return null;
  if (n > MAX_DB_INT) return 1;
  return Math.floor(n);
}
