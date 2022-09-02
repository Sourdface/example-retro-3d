// @ts-check

let enabled = true;

/**
 * @module debug
 *
 * Debug utilities.
 */

/**
 * Respond to a key
 * @param {string} key Key to listen for
 * @param {(e: KeyboardEvent) => void} handler
 */
export function onKeyDown(key, handler) {
  window.addEventListener('keydown', (e) => {
    if (e.key === key) {
      handler(e);
    }
  });
}
