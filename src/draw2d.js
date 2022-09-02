// @ts-check

/**
 * @module draw
 *
 * Provides the ability to draw things to the screen.
 *
 * All coordinates used within this module are interpreted as cell positions, except where stated otherwise. They will be converted to pixel positions when drawn.
 */


import * as Debug from './debug.js';
import * as Geom from './geom.js';
import * as Color from './color.js';

/**
 * Describes a 2D visual element that can be drawn to the screen.
 *
 * @exports Sprite2D
 * @typedef {Geom.Box2D & _Sprite} Sprite2D
 * @typedef _Sprite
 * @prop {Color.MPal} color Color of the sprite
 * @prop {number} type Currently unused.
 * @prop {number} z Indicates order of drawing in relation to other queued sprites
 */

/**
 * Internal format used for 2D sprites in the sprite pool
 *
 * @typedef {Sprite2D & __PoolSprite2D} _PoolSprite2D
 * @typedef __PoolSprite2D
 * @prop {number} _drawIndex Position within the drawing order of the sprite within its target layer
 */

/**
 * Maximum number of `Sprite2D`'s that can be drawn across all layers
 */
export const SPRITE_2D_POOL_SIZE = 4096;

/**
 * Reference to the main canvas element.
 *
 * @type {HTMLCanvasElement}
 */
export let canvas;

/**
 * Reference to the main canvas context.
 *
 * @type {CanvasRenderingContext2D}
 */
export let ctx;

/**
 * Size in pixels of a single cell in the canvas.
 *
 * Partially determines the size of the canvas.
 *
 * @type {Geom.Vector2D}
 */
export const cellSize = { x: 4, y: 4 };

/**
 * Size of the canvas in cells.
 *
 * Partially determines the size of the canvas.
 *
 * @type {Geom.Vector2D}
 */
export const gridSize = { x: 32, y: 18 };

/**
 * Current mouse position in grid coordinates.
 *
 * TODO: Currently unused.
 *
 * @type {Geom.Vector2D}
 */
export const mousePos = { x: 0, y: 0 };

/**
 * Pool of pre-allocated `Sprite2D`'s
 *
 * @type {readonly (_PoolSprite2D)[]}
 */
const _sprite2DPool = Array.from(Array(SPRITE_2D_POOL_SIZE))
  .map(() => /** @type {_PoolSprite2D} */({ x: 0, y: 0, w: 0, h: 0, color: 0xFFFF, type: 0, z: 0, _drawIndex: 0 }));

/**
 * Index of next `Sprite2D` index to be queued
 */
let _nextSprite2DIndex = 0;

/**
 * Initialize the drawing subsystem
 */
export function setup() {
  canvas = /** @type {HTMLCanvasElement} */ (document.getElementById('canvas'));
  ctx = /** @type {CanvasRenderingContext2D} */ (canvas.getContext('2d'));

  window.addEventListener('click', _onWindowClick);
  window.addEventListener('mouseup', _onWindowMouseUp);

  canvas.addEventListener('mousedown', _onCanvasMouseDown);
  canvas.addEventListener('mousemove', _onCanvasMouseMove);

  update();
}

/**
 * @param {MouseEvent} e
 */
function _onWindowClick(e) {
  // canvas.requestFullscreen({ navigationUI: 'hide' });
}

/**
 * @param {MouseEvent} e
 */
function _onWindowMouseUp(e) {

}

/**
 * @param {MouseEvent} e
 */
function _onCanvasMouseDown(e) {

}

/**
 * @param {MouseEvent} e
 */
function _onCanvasMouseMove(e) {

}

/**
 * Performs all pending draw operations.
 */
export function update() {
  const canvasW = cellSize.x * gridSize.x;
  const canvasH = cellSize.y * gridSize.y;

  _canvasReset(canvasW, canvasH);
  _sprites2DRender();
}

/**
 * @param {number} canvasW
 * @param {number} canvasH
 */
function _canvasReset(canvasW, canvasH) {
  if (canvas.width !== canvasW || canvas.height !== canvasH) {
    canvas.width = canvasW;
    canvas.height = canvasH;
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function _sprites2DRender() {
  _sprite2DPoolSorted.length = _sprite2DPool.length;
  Object.assign(_sprite2DPoolSorted, _sprite2DPool);
  _sprite2DPoolSorted.sort(_sprite2DPoolSort);

  for (const spr2D of _sprite2DPoolSorted) {
    if (!spr2D || !spr2D.w || !spr2D.h) {
      continue;
    }
    ctx.fillStyle = Color.mpalToCssHex(spr2D.color);
    ctx.fillRect(
      Math.round((spr2D.x) * cellSize.x),
      Math.round((spr2D.y) * cellSize.y),
      Math.round(spr2D.w * cellSize.x),
      Math.round(spr2D.h * cellSize.y)
    );
    spr2D.w = 0;
  }
}

/**
 * @type {Sprite2D[]}
 */
const _sprite2DPoolSorted = [];

/**
 * @param {Sprite2D} a
 * @param {Sprite2D} b
 */
function _sprite2DPoolSort(a, b) {
  if (a.z != b.z) {
    return b.z - a.z;
  } else {
    // TODO: There is probably a better sorting rule than this
    const aX = (a.x + a.w * .5) - gridSize.x * .5;
    const aY = (a.y + a.h * .5) - gridSize.y * .5;
    const bX = (b.x + b.w * .5) - gridSize.x * .5;
    const bY = (b.y + b.h * .5) - gridSize.y * .5;
    const aDist = (aX ** 2 + aY ** 2) ** .5;
    const bDist = (bX ** 2 + bY ** 2) ** 0.5;
    return aDist - bDist;
  }
}

/**
 * Queue a `Sprite2D` to be drawn at the given layer during the next draw cycle
 *
 * @param {Readonly<Sprite2D>} [spr2DSrc] Source sprite for data to be queued in
 * dest sprite. If provided, data from this sprite will be copied into the
 * destination sprite.
 *
 * @return {Sprite2D} Sprite that was queued. If a source sprite was passed,
 * data in this sprite will be the same as that which was passed. Otherwise, the
 * state will be unknown and the consumer will be required to update its data.
 */
export function queueSprite2D(spr2DSrc) {
  const spr2DDest = _sprite2DPool[_nextSprite2DIndex];

  if (spr2DSrc) {
    spr2DDest.x = spr2DSrc.x;
    spr2DDest.y = spr2DSrc.y;
    spr2DDest.w = spr2DSrc.w;
    spr2DDest.h = spr2DSrc.h;
    spr2DDest.color = spr2DSrc.color;
    spr2DDest.type = spr2DSrc.type;
    spr2DDest.z = spr2DSrc.z;
  }

  _nextSprite2DIndex++;
  if (_nextSprite2DIndex >= SPRITE_2D_POOL_SIZE) {
    _nextSprite2DIndex = 0;
  }

  return spr2DDest
}
