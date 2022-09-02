// @ts-check

/**
 * @module coin
 *
 * Provides the behavior of coins collectable by the player.
 */

import * as Draw3D from "./draw3d.js";
import * as Collision from "./collision.js";
import * as Player from "./player.js";

/**
 * @typedef {Draw3D.Sprite3D & _Coin} Coin
 * @typedef _Coin
 * @prop {boolean} enabled
 *
 * @exports Coin
 */

/**
 * @type {Coin[]}
 */
export const coins = [];

export let collectCount = 0;

export function setup() {
  for (let i = 0; i < 100; i++) {
    coins.push({
      type: 3,
      color: 0b111_111_000,
      h: 1,
      w: 1,
      x: 0,
      y: 0,
      enabled: false,
      z: 0,
      d: 1,
    });
  }
}

/**
 * Set state of a preallocated coin
 * @param {number} i Index of coin
 * @param {number} x X position of coin
 * @param {number} y Y position of coin
 * @param {number} z Z position of coin
 */
export function set(i, x, y, z) {
  coins[i].x = x;
  coins[i].y = y;
  coins[i].z = z;
  coins[i].enabled = true;
}

/**
 * Return the index of the first coin that is not enabled. Return -1 if all coins are enabled.
 */
export function next() {
  for (let i = 0; i < coins.length; i++) {
    if (!coins[i].enabled) {
      return i;
    }
  }
  return -1;
}

export function update() {
  for (let i = 0; i < coins.length; i++) {
    if (coins[i].enabled) {
      if (Collision.rectIntersectBox3D(Player.player, coins[i])) {
        collect(i);
      }

      Draw3D.queueSprite3D(coins[i]);
    }
  }
}

/**
 * Collect coin at index
 * @param {number} i Index of coin
 */
export function collect(i) {
  coins[i].enabled = false;
  collectCount++;
}