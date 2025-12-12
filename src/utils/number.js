/**
 * Format scores to avoid floating point artifacts.
 * - Integers: no decimals (9.999999999999998 -> 10)
 * - Decimals: up to 3 places, trimmed (0.333333 -> 0.333)
 */
export function formatScore(n) {
  const epsilon = 1e-9;
  const nearestInt = Math.round(n);
  if (Math.abs(n - nearestInt) < epsilon) return String(nearestInt);
  const rounded = Math.round(n * 1000) / 1000;
  return String(rounded);
}
