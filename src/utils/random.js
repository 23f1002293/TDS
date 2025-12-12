/** Pick n random elements from an array without replacement */
export const choose = (arr, n, random) => arr.sort(() => random() - 0.5).slice(0, n);

/** Pick a single random element from an array */
export const pick = (array, random) => array[Math.floor(random() * array.length)];

/** Randomly re-order the array */
export const shuffle = function(array, random) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};
