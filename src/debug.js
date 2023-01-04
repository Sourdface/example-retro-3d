// @ts-check

/**
 * @module debug
 *
 * Debug utilities.
 */

/**
 * Whether or not debug mode is enabled.
 */
// eslint-disable-next-line prefer-const
export let enabled = true

/**
 * Respond to a key when debug mode is enabled.
 *
 * @param {string} key Key to listen for
 * @param {(e: KeyboardEvent) => void} handler
 */
export function onKeyDown (key, handler) {
  window.addEventListener('keydown', (e) => {
    if (!enabled) {
      return
    }

    if (e.key === key) {
      handler(e)
    }
  })
}
