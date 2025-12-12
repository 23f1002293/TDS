/**
 * @fileoverview Utility module for triggering file downloads in the browser.
 *
 * @example
 * import { download } from './download.js';
 *
 * // Download a text file
 * const blob = new Blob(['Hello World'], { type: 'text/plain' });
 * download(blob, 'hello.txt');
 *
 * // Download an image
 * fetch('image.jpg')
 *   .then(response => response.blob())
 *   .then(blob => download(blob, 'downloaded-image.jpg'));
 *
 * @module download
 */

/**
 * Triggers a file download in the browser by creating a temporary anchor element.
 * @param {Blob} blob - The Blob or File object to be downloaded
 * @param {string} name - The filename to be used for the download
 * @returns {void}
 */
export function download(blob, name) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
