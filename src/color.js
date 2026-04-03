// @ts-check

/**
 * @module color
 *
 * Provides types and utilities for working with colors
 */

/**
 * Color represented as RGB components as a set of 3 individual floating-point
 * numbers in the range 0.0 to 1.0
 *
 * @exports Floats
 * @typedef {[r: number, g: number, b: number]} Floats
 */

/**
 * Color represented as a CSS RGBA hex color code string
 *
 * @exports CssHex
 * @typedef {string} CssHex
 */

/**
 * Color represented as RGB components in minimal palette format
 *
 * Minimal palette format colors are 9-bit unsigned integers with bit ranges
 * within the value subdivided into groups of 3 bits each, with each group
 * allocated to a channel of the color in the following layout:
 *
 * ```text
 * Bit layout left-to-right: RRRGGGBBB
 * ```
 *
 * @exports MPal
 * @typedef {number} MPal
 */

/**
 * Used internally for various operations
 *
 * @type {Floats}
 */
const _floatsTemp = [0, 0, 0]

/**
 * Convert a minimal palette format color to rgba floating point components
 *
 * @param {MPal} mpal
 * @param {Floats} floats Stores the result of the operation
 */
export function mpalToFloats (mpal, floats) {
  floats[0] = ((mpal & 0b111_000_000) >>> 6) / 0b111
  floats[1] = ((mpal & 0b000_111_000) >>> 3) / 0b111
  floats[2] = ((mpal & 0b000_000_111) >>> 0) / 0b111
}

/**
 * Convert floating point color components to minimal palette color format
 * @param {Floats} floats
 * @return {MPal}
 */
export function floatsToMpal ([r, g, b]) {
  return (
    (((r * 0b111) & 0b111) << 6) |
    (((g * 0b111) & 0b111) << 3) |
    (((b * 0b111) & 0b111) << 0)
  ) >>> 0
}

/**
 * Convert a minimal palette format color to css hex color code
 *
 * @param {MPal} mpal
 * @return {CssHex}
 */
export function mpalToCssHex (mpal) {
  const r = ((((mpal & 0b111_000_000) >> 6) * (0xFF / 0b111)) | 0) << 16
  const g = ((((mpal & 0b000_111_000) >> 3) * (0xFF / 0b111)) | 0) << 8
  const b = ((((mpal & 0b000_000_111) >> 0) * (0xFF / 0b111)) | 0) << 0
  return `#${((r | g | b) >>> 0).toString(16).toUpperCase().padStart(6, '0')}`
}

/**
 * Multiply each channel of a minimal palette format color by given factors
 *
 * @param {MPal} mpal
 * @param {number} rf Red factor (float)
 * @param {number} gf Green factor (float)
 * @param {number} bf Blue factor (float)
 * @return {MPal}
 */
export function mpalMult (mpal, rf, gf, bf) {
  mpalToFloats(mpal, _floatsTemp)
  _floatsTemp[0] = Math.min(Math.max(_floatsTemp[0] * rf, 0), 1)
  _floatsTemp[1] = Math.min(Math.max(_floatsTemp[1] * gf, 0), 1)
  _floatsTemp[2] = Math.min(Math.max(_floatsTemp[2] * bf, 0), 1)
  return floatsToMpal(_floatsTemp)
}
