// @ts-check

import * as Draw3D from './draw3d.js';

/**
 * @typedef {Draw3D.Sprite3D & _Wall} Wall
 * @typedef _Wall
 * @prop {boolean} solid
 * @prop {boolean} visible
 */

/**
 * @type {Wall[]}
 */
export const walls = [];

export function setup() {
  for (let i = 0; i < 256; i++) {
    walls.push({
      color: 0b110_101_011,
      d: 0,
      h: 0,
      solid: false,
      type: 2,
      visible: false,
      w: 0,
      x: 0,
      y: 0,
      z: 0,
    });
  }
}

/**
 * @param {number} i
 * @param {number} x
 * @param {number} y
 * @param {number} z
 * @param {number} w
 * @param {number} h
 * @param {number} d
 * @param {boolean} solid
 * @param {boolean} visible
 */
export function set(i, x, y, z, w, h, d, solid, visible) {
  walls[i].x = x;
  walls[i].y = y;
  walls[i].z = z;
  walls[i].w = w;
  walls[i].h = h;
  walls[i].d = d;
  walls[i].solid = solid;
  walls[i].visible = visible;
}

/**
 * Returns the index of the first wall that is neither visible nor solid.
 * @returns {number}
 */
export function next() {
  for (let i = 0; i < walls.length; i++) {
    if (!walls[i].visible && !walls[i].solid) {
      return i;
    }
  }
  return -1;
}

export function update() {
  for (let i = 0; i < walls.length; i++) {
    if (walls[i].visible) {
      Draw3D.queueSprite3D(walls[i]);
    }
  }
}
