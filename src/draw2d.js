// @ts-check

/**
 * @module draw2d
 *
 * Provides the ability to draw things to the screen in 2D.
 *
 * All coordinates used within this module are interpreted as cell positions,
 * except where stated otherwise. They will be converted to pixel positions when
 * drawn.
 */

import * as Color from './color.js';

/**
 * Describes a 2D visual element that can be drawn to the screen.
 *
 * @exports Sprite2D
 * @typedef {import('./geom.js').Box2D & _Sprite} Sprite2D
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
 * @type {Sprite2D[]}
 */
const _sprite2DPoolSorted = [];

/**
 * Size in pixels of a single cell in the canvas.
 *
 * Partially determines the size of the canvas.
 *
 * @type {import('./geom.js').Vector2D}
 */
export const cellSize = { x: 4, y: 4 };

/**
 * Size of the canvas in cells.
 *
 * Partially determines the size of the canvas.
 *
 * @type {import('./geom.js').Vector2D}
 */
export const gridSize = { x: 32, y: 18 };

/**
 * Current mouse position in grid coordinates.
 *
 * TODO: Currently unused.
 *
 * @type {import('./geom.js').Vector2D}
 */
export const mousePos = { x: 0, y: 0 };

/**
 * Index of next `Sprite2D` index to be queued
 */
let _nextSprite2DIndex = 0;

/**
 * @type {HTMLCanvasElement}
 */
let _canvasFilterMask;

/**
 * @type {CanvasRenderingContext2D}
 */
let _ctxFilterMask;

/**
 * Reference to the buffer canvas element.
 *
 * @type {HTMLCanvasElement}
 */
export let canvasBuffer;

/**
 * Reference to the context for the buffer canvas.
 *
 * @type {CanvasRenderingContext2D}
 */
export let ctxBuffer;

/**
 * Reference to the screen canvas element.
 *
 * @type {HTMLCanvasElement}
 */
export let canvasScreen;

/**
 * Reference to the screen canvas context.
 *
 * @type {CanvasRenderingContext2D}
 */
export let ctxScreen;

/**
 * Whether or not to use the filter effect
 *
 * TODO: This is disabled by default because the effect isn't particularly great
 * and it causes a big delay in initialization.
 */
// eslint-disable-next-line prefer-const
export let filterEnabled = false;

/**
 * Relative resolution of the filter effect
 */
// eslint-disable-next-line prefer-const
export let filterRes = 12;

/**
 * Scale of the filter effect
 */
// eslint-disable-next-line prefer-const
export let filterScale = 1 / 3;

/**
 * Pool of pre-allocated `Sprite2D`'s
 *
 * @type {readonly (_PoolSprite2D)[]}
 */
const _sprite2DPool = Array.from(Array(SPRITE_2D_POOL_SIZE))
  .map(() => /** @type {_PoolSprite2D} */({
    x: 0, y: 0, w: 0, h: 0, color: 0xFFFF, type: 0, z: 0, _drawIndex: 0,
  }));

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
 * @param {Sprite2D} a
 * @param {Sprite2D} b
 */
function _sprite2DPoolSort(a, b) {
  if (a.z !== b.z) {
    return b.z - a.z;
  }
  // TODO: There is probably a better sorting rule than this
  const aX = (a.x + a.w * 0.5) - gridSize.x * 0.5;
  const aY = (a.y + a.h * 0.5) - gridSize.y * 0.5;
  const bX = (b.x + b.w * 0.5) - gridSize.x * 0.5;
  const bY = (b.y + b.h * 0.5) - gridSize.y * 0.5;
  const aDist = (aX ** 2 + aY ** 2) ** 0.5;
  const bDist = (bX ** 2 + bY ** 2) ** 0.5;
  return aDist - bDist;
}

function _canvasReset() {
  /** @type {number} */
  const bufferW = cellSize.x * gridSize.x;
  /** @type {number} */
  const bufferH = cellSize.y * gridSize.y;

  /** @type {number} */
  let canvasW;
  /** @type {number} */
  let canvasH;
  if (filterEnabled) {
    canvasBuffer.width = bufferW;
    canvasBuffer.height = bufferH;
    ctxBuffer.fillStyle = '#000000FF';
    ctxBuffer.fillRect(0, 0, canvasBuffer.width, canvasBuffer.height);

    canvasW = bufferW * filterRes;
    canvasH = bufferH * filterRes;
    if (_canvasFilterMask.width !== canvasW || _canvasFilterMask.height !== canvasH) {
      _canvasFilterMask.width = canvasW;
      _canvasFilterMask.height = canvasH;
      _ctxFilterMask.fillStyle = '#000000FF';
      _ctxFilterMask.fillRect(0, 0, canvasW, canvasH);

      const dotSize = filterRes / 2 * filterScale;

      const xG = Math.cos(Math.PI * 1 / 2) * dotSize;
      const yG = Math.sin(Math.PI * 1 / 2) * dotSize;

      const xR = Math.cos(Math.PI * 1 / 2 + Math.PI * 2 / 3) * dotSize;
      const yR = Math.sin(Math.PI * 1 / 2 + Math.PI * 2 / 3) * dotSize;

      const xB = Math.cos(Math.PI * 1 / 2 + Math.PI * 4 / 3) * dotSize;
      const yB = Math.sin(Math.PI * 1 / 2 + Math.PI * 4 / 3) * dotSize;

      const r = dotSize * 0.7;

      const t = Math.PI * 2;

      for (let row = 0; row < canvasH / filterScale; row++) {
        for (let col = 0; col < canvasW / filterScale; col++) {
          const x = ((col + 1 / 2) * dotSize * 8 / 3);
          const y = ((row + 1 / 2) * dotSize * 3) + (col & 1 ? 0 : dotSize * 1 / 2);
          const yS = col & 1 ? 1 : -1;

          _ctxFilterMask.fillStyle = '#FF0000FF';
          _ctxFilterMask.beginPath();
          _ctxFilterMask.arc(x + xR, y + yR * yS, r, 0, t);
          _ctxFilterMask.fill();

          _ctxFilterMask.fillStyle = '#00FF00FF';
          _ctxFilterMask.beginPath();
          _ctxFilterMask.arc(x + xG, y + yG * yS, r, 0, t);
          _ctxFilterMask.fill();

          _ctxFilterMask.fillStyle = '#0000FFFF';
          _ctxFilterMask.beginPath();
          _ctxFilterMask.arc(x + xB, y + yB * yS, r, 0, t);
          _ctxFilterMask.fill();
        }
      }
    }
  } else {
    canvasW = bufferW;
    canvasH = bufferH;
  }

  canvasScreen.width = canvasW;
  canvasScreen.height = canvasH;

  ctxScreen.fillStyle = '#000000FF';
  ctxScreen.fillRect(0, 0, canvasScreen.width, canvasScreen.height);
}

function _sprites2DRender() {
  _sprite2DPoolSorted.length = _sprite2DPool.length;
  Object.assign(_sprite2DPoolSorted, _sprite2DPool);
  _sprite2DPoolSorted.sort(_sprite2DPoolSort);

  const ctx = filterEnabled ? ctxBuffer : ctxScreen;

  for (const spr2D of _sprite2DPoolSorted) {
    if (!spr2D || !spr2D.w || !spr2D.h) {
      continue;
    }
    ctx.fillStyle = Color.mpalToCssHex(spr2D.color);
    ctx.fillRect(
      Math.round((spr2D.x) * cellSize.x),
      Math.round((spr2D.y) * cellSize.y),
      Math.round(spr2D.w * cellSize.x),
      Math.round(spr2D.h * cellSize.y),
    );
    spr2D.w = 0;
  }

  if (filterEnabled) {
    ctxScreen.globalAlpha = 1.0;
    ctxScreen.globalCompositeOperation = 'copy';
    ctxScreen.drawImage(_canvasFilterMask, 0, 0);
    ctxScreen.globalCompositeOperation = 'multiply';
    ctxScreen.imageSmoothingEnabled = false;
    ctxBuffer.imageSmoothingEnabled = false;
    ctxScreen.drawImage(canvasBuffer, 0, 0, canvasBuffer.width, canvasBuffer.height, 0, 0, canvasScreen.width, canvasScreen.height);
    ctxScreen.globalAlpha = 0.5;
    ctxScreen.globalCompositeOperation = 'lighten';
    ctxScreen.imageSmoothingEnabled = true;
    ctxScreen.imageSmoothingQuality = 'low';
    ctxScreen.drawImage(canvasBuffer, 0, 0, canvasBuffer.width, canvasBuffer.height, 0, 0, canvasScreen.width, canvasScreen.height);
  }
}

/**
 * Initialize the drawing subsystem
 */
export function setup() {
  canvasBuffer = document.createElement('canvas');
  ctxBuffer = /** @type {CanvasRenderingContext2D} */ (canvasBuffer.getContext('2d'));
  canvasScreen = /** @type {HTMLCanvasElement} */ (document.getElementById('canvas'));
  ctxScreen = /** @type {CanvasRenderingContext2D} */ (canvasScreen.getContext('2d'));

  _canvasFilterMask = document.createElement('canvas');
  _ctxFilterMask = /** @type {CanvasRenderingContext2D} */ (_canvasFilterMask.getContext('2d'));

  window.addEventListener('click', _onWindowClick);
  window.addEventListener('mouseup', _onWindowMouseUp);

  canvasScreen.addEventListener('mousedown', _onCanvasMouseDown);
  canvasScreen.addEventListener('mousemove', _onCanvasMouseMove);

  update();
}

/**
 * Performs all pending draw operations.
 */
export function update() {
  _canvasReset();
  _sprites2DRender();
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

  return spr2DDest;
}
