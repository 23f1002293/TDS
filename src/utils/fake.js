const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
const charProbability = 0.8;
const spaceProbability = 0.99;

/**
 * Generate a random word, typically 1-10 characters long.
 * @param {function} random - A random number generator.
 * @returns {string} A random word.
 */
export function fakeWord(random) {
  return Array.from({ length: Math.floor(random() * 10) + 1 }, () => chars[Math.floor(random() * chars.length)]).join(
    "",
  );
}

/**
 * Generate a random text with a given number of lines.
 * @param {number} count - The number of lines.
 * @param {function} random - A random number generator.
 * @returns {string} A random text with a given number of lines.
 */
export function fakeText(count, random) {
  return Array.from({ length: count }, () => {
    const rnd = random();
    return rnd < charProbability
      ? chars[Math.floor((rnd / charProbability) * chars.length)]
      : rnd < spaceProbability
      ? " "
      : "\n";
  });
}
