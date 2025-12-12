/**
 * @fileoverview Countdown timer module that provides precise timing between two timestamps
 * with browser tab-aware updates.
 *
 * @example
 * import { countdown, formatTime } from './countdown.js';
 *
 * // Start a countdown that runs from now until 1 hour in the future
 * countdown({
 *   startTime: new Date(),
 *   endTime: new Date(Date.now() + 3600000),
 *   callback: ({ status, time }) => {
 *     switch (status) {
 *       case 'pending':
 *         console.log(`Starting in: ${formatTime(time)}`);
 *         break;
 *       case 'running':
 *         console.log(`Time remaining: ${formatTime(time)}`);
 *         break;
 *       case 'ended':
 *         console.log(`Ended ${formatTime(time)} ago`);
 *         break;
 *     }
 *   }
 * });
 *
 * @module countdown
 */

let lastTick, config;

/**
 * Initializes and starts a countdown timer between two timestamps.
 * @param {Object} params - The countdown parameters
 * @param {Date} params.startTime - The time when the countdown should begin
 * @param {Date} params.endTime - The time when the countdown should end
 * @param {Function} params.callback - Callback function that receives status updates
 * @param {Object} params.callback.status - Status object passed to callback
 * @param {('pending'|'running'|'ended')} params.callback.status.status - Current countdown state
 * @param {number} params.callback.status.time - Time difference in milliseconds
 * @returns {void}
 */
export function countdown({ startTime, endTime, callback }) {
  config = { startTime, endTime, callback };
  requestAnimationFrame(tickCountdown);
}

/**
 * Updates the countdown every second.
 * Uses setTimeout AND requestAnimationFrame to update only once per second, and only when tab is active.
 * @param {number} currentTick - The current tick timestamp.
 */
export function tickCountdown(currentTick) {
  if (lastTick !== undefined && currentTick - lastTick < 1000) {
    requestAnimationFrame(tickCountdown);
    return;
  }

  lastTick = currentTick;
  const currentTime = new Date();

  if (currentTime < config.startTime) config.callback({ status: "pending", time: config.startTime - currentTime });
  else if (currentTime > config.endTime) config.callback({ status: "ended", time: currentTime - config.endTime });
  else config.callback({ status: "running", time: config.endTime - currentTime });

  setTimeout(() => requestAnimationFrame(tickCountdown), 1000);
}

/**
 * Formats milliseconds into HH:MM:SS format, where HH can span multiple days.
 * @param {number} milliseconds - The number of milliseconds to format.
 * @return {string} The formatted time string.
 */
export const formatTime = (milliseconds) => {
  const days = Math.floor(milliseconds / 86400000);
  const hours = Math.floor((milliseconds % 86400000) / 3600000);
  const minutes = Math.floor((milliseconds % 3600000) / 60000);
  const seconds = Math.floor((milliseconds % 60000) / 1000);
  const padWithZero = (num) => String(num).padStart(2, "0");
  return days > 0
    ? `${days}d ${padWithZero(hours)}:${padWithZero(minutes)}:${padWithZero(seconds)}`
    : `${padWithZero(hours)}:${padWithZero(minutes)}:${padWithZero(seconds)}`;
};

/**
 * Formats a date into a specific string format: "Wed 13 Aug 2024, 4:30 pm SGT".
 * @param {Date} date - The date to format.
 * @return {string} The formatted date string.
 */
export const formatDateTime = (date) => {
  const options = {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
    timeZoneName: "short",
  };
  return date.toLocaleString("en-IN", options);
};
