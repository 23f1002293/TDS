/**
 * Load an image from a URL. Usage: `const img = await loadImage("image.png")`
 * ```
 * @param {string} src - The URL of the image
 * @returns {Promise<HTMLImageElement>} A promise that resolves to the image
 */
export const loadImage = (src) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });

/**
 * Get the image data of an image. Usage: `const data = imageData(img)`
 * @param {HTMLImageElement} img - The image to get the data of
 * @returns {Uint8ClampedArray} The image data
 */
export const imageData = (img) => {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  canvas.width = img.width;
  canvas.height = img.height;
  ctx.drawImage(img, 0, 0);
  return ctx.getImageData(0, 0, canvas.width, canvas.height).data;
};
