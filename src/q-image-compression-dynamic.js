import { html } from "https://cdn.jsdelivr.net/npm/lit-html@3/lit-html.js";
import seedrandom from "seedrandom";
import { imageData, loadImage } from "./utils/image.js";

export default async function({ user, weight = 1 }) {
  const id = "q-image-compression-dynamic";
  const title = "Compress an image";

  const random = seedrandom(`${user.email}#${id}`);

  // Generate an image with 3 semi-transparent rectangles on a 500×500 canvas
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 500;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, 500, 500);
  ctx.globalAlpha = 0.5;
  ["red", "green", "blue"].forEach((color) => {
    ctx.fillStyle = color;
    ctx.fillRect(random() * (500 - 100), random() * (500 - 100), 100, 100);
  });

  // turn it into an Image and grab its pixel data
  const dataUrl = canvas.toDataURL("image/png");
  const originalImg = await loadImage(dataUrl);
  const originalData = imageData(originalImg);

  const answer = async () => {
    const $image = document.getElementById(id);
    if (!$image.files.length) throw new Error("No image uploaded");

    const image = $image.files[0];
    if (image.size > 400) throw new Error("Image should be less than 400 bytes");

    const uploadedImg = await loadImage(URL.createObjectURL(image));
    if (originalImg.width !== uploadedImg.width || originalImg.height !== uploadedImg.height) {
      throw new Error("Image dimensions do not match the original");
    }

    try {
      const uploadedData = imageData(uploadedImg);
      if (!originalData.every((v, i) => v === uploadedData[i])) {
        throw new Error("Image pixels do not match the original");
      }
    } catch (e) {
      throw new Error(`Could not process image. Is it a browser-supported image? ${e.message}`);
    }

    return true;
  };

  const question = html`
    <div class="mb-3">
      <p><strong>Case Study: eShopCo Bandwidth Reduction</strong></p>
      <p>
        eShopCo, a global e-commerce platform, delivers thousands of product images every day. By ensuring each image is
        losslessly compressed below 400 bytes, they reduce page load times by 30%, improve search ranking, and cut
        bandwidth costs—all while maintaining crystal-clear visuals that drive customer engagement.
      </p>
      <p>Download the image below and compress it <em>losslessly</em> to an image that is less than 400 bytes.</p>
      <p><img src="${dataUrl}" width="500" height="500" /></p>
      <p>By losslessly, we mean that every pixel in the new image should be identical to the original image.</p>
      <label for="${id}" class="form-label"> Upload your losslessly compressed image (less than 400 bytes) </label>
      <input class="form-control" id="${id}" name="${id}" type="file" accept="image/*" />
    </div>
  `;

  return { id, title, weight, question, answer };
}
