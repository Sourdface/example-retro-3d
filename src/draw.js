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

Debug.onKeyDown(']', () => {
  cellSize.x += 1;
  cellSize.y = cellSize.x;
  cellSize.z = cellSize.x;
});

Debug.onKeyDown('[', () => {
  cellSize.x -= 1;
  cellSize.y = cellSize.x;
  cellSize.z = cellSize.x;
});

Debug.onKeyDown('-', () => {
  fov -= 1;
});

Debug.onKeyDown('=', () => {
  fov += 1;
});

Debug.onKeyDown(',', () => {
  viewOffset.z -= 0.2;
});

Debug.onKeyDown('.', () => {
  viewOffset.z += 0.2;
});

Debug.onKeyDown(';', () => {
  fogScale -= 0.02;
});

Debug.onKeyDown('\'', () => {
  fogScale += 0.02;
})

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
 * Describes a 3D visual element that can be drawn to the screen
 *
 * @exports Sprite3D
 * @typedef {Geom.Box3D & Omit<Sprite2D, 'layerId'>} Sprite3D
 */

/**
 * Maximum number of `Sprite3D`'s that can be drawn per cycle, and max number of
 * `Sprite2D`'s per layer.
 *
 * FIXME: Causes flicker when not equal to 2d pool size
 */
const SPRITE_3D_POOL_SIZE = 4096;

/**
 * Maximum number of `Sprite2D`'s that can be drawn across all layers
 *
 * FIXME: Causes flicker when not equal to 3d pool size
 */
const SPRITE_2D_POOL_SIZE = 4096;

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
 * @type {Geom.Vector3D}
 */
export const cellSize = { x: 4, y: 4, z: 4 };

/**
 * Size of the canvas in cells.
 *
 * Partially determines the size of the canvas.
 *
 * @type {Geom.Vector3D}
 */
export const gridSize = { x: 32, y: 18, z: 32 };

/**
 * Current mouse position in grid coordinates.
 *
 * TODO: Currently unused.
 *
 * @type {Geom.Vector2D}
 */
export const mousePos = { x: 0, y: 0 };

/**
 * Offset of the view within the current scene.
 *
 * This value is subtracted from the position of all objects drawn to the canvas.
 *
 * @type {Geom.Vector3D}
 */
export const viewOffset = { x: 0, y: 0, z: 8 };

/**
 * Field of view.
 *
 * Measured in degrees.
 *
 * A value of 180 / Math.PI (1 radian) will project objects 1 unit away from the camera at 1:1 scale.
 */
let fov = 180 / Math.PI / 24;

/**
 * Scale factor of fog effect as distance from the camera increases
 */
let fogScale = 0.044;

let fogOffset = 1.006 ;

let zNear = 5;

/**
 * Pool of pre-allocated `Sprite3D`'s
 *
 * @type {readonly Sprite3D[]}
 */
const _sprite3DPool = Array.from(Array(SPRITE_3D_POOL_SIZE))
  .map(() => /** @type {Sprite3D} */({ x: 0, y: 0, z: 0, w: 0, h: 0, d: 0, color: 0xFFFF, type: 0 }));

/**
 * Pool of pre-allocated `Sprite2D`'s
 *
 * @type {readonly (_PoolSprite2D)[]}
 */
const _sprite2DPool = Array.from(Array(SPRITE_2D_POOL_SIZE))
  .map(() => /** @type {_PoolSprite2D} */({ x: 0, y: 0, w: 0, h: 0, color: 0xFFFF, type: 0, z: 0, _drawIndex: 0 }));

/**
 * Index of next `Sprite3D` from the pool to be queued
 */
let _nextSprite3DIndex = 0;

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
  const canvasD = cellSize.z * gridSize.z;

  _canvasReset(canvasW, canvasH);
  _sprites3DRender(canvasD);
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

/**
 * @param {number} canvasD
 */
function _sprites3DRender(canvasD) {
  const fovR = fov * Math.PI / 180;

  const gridCX = gridSize.x * 0.5;
  const gridCY = gridSize.y * 0.5;
  const gridCZ = gridSize.z * 0.5;

  const vOffX = -(viewOffset.x + gridCX);
  const vOffY = -(viewOffset.y + gridCY);
  const vOffZ =  (viewOffset.z + gridCZ);

  for (const spr3D of _sprite3DPool) {
    if (!spr3D.w || !spr3D.h || !spr3D.d) {
      continue;
    }

    const spr3DX1 = spr3D.x + vOffX;
    const spr3DY1 = spr3D.y + vOffY;
    const spr3DZ1 = spr3D.z + vOffZ;

    const spr3DX2 = spr3DX1 + spr3D.w;
    const spr3DY2 = spr3DY1 + spr3D.h;

    const layerCount = spr3D.d * cellSize.z;

    for (let i = 0; i < layerCount; i++) {
      const spr2D = _sprite2DPool[_nextSprite2DIndex];

      spr2D.z = spr3DZ1 + i / cellSize.z;

      if (spr2D.z < zNear) {
        continue;
      }

      const zScale = 1 / spr2D.z / fovR;

      const spr2DX1 = spr3DX1 * zScale;
      const spr2DY1 = spr3DY1 * zScale;

      const spr2DX2 = spr3DX2 * zScale;
      const spr2DY2 = spr3DY2 * zScale;

      spr2D.x = spr2DX1 + gridCX;
      spr2D.y = spr2DY1 + gridCY;
      spr2D.w = spr2DX2 - spr2DX1;
      spr2D.h = spr2DY2 - spr2DY1;

      const fog = (1 - spr2D.z * fogScale) + fogOffset;
      spr2D.color = Color.mpalMult(spr3D.color, fog, fog, fog);

      spr2D.type = spr3D.type;

      queueSprite2D(spr2D);
    }

    spr3D.w = 0;
  }
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
 * Queue a `Sprite3D` to be drawn at the next draw cycle
 *
 * @param {Readonly<Sprite3D>} spr3DSrc Sprite to be queued
 */
export function queueSprite3D(spr3DSrc) {
  const spr3DDest = _sprite3DPool[_nextSprite3DIndex];
  spr3DDest.x = spr3DSrc.x;
  spr3DDest.y = spr3DSrc.y;
  spr3DDest.z = spr3DSrc.z;
  spr3DDest.w = spr3DSrc.w;
  spr3DDest.h = spr3DSrc.h;
  spr3DDest.d = spr3DSrc.d;
  spr3DDest.color = spr3DSrc.color;
  spr3DDest.type = spr3DSrc.type;
  _nextSprite3DIndex++;
  if (_nextSprite3DIndex >= SPRITE_3D_POOL_SIZE) {
    _nextSprite3DIndex = 0;
  }
}

/**
 * Queue a `Sprite2D` to be drawn at the given layer during the next draw cycle
 *
 * @param {Readonly<Sprite2D>} spr2DSrc Source sprite for data to be queued in dest sprite
 * higher numbers to the front
 */
export function queueSprite2D(spr2DSrc) {
  const spr2DDest = _sprite2DPool[_nextSprite2DIndex];

  spr2DDest.x = spr2DSrc.x;
  spr2DDest.y = spr2DSrc.y;
  spr2DDest.w = spr2DSrc.w;
  spr2DDest.h = spr2DSrc.h;
  spr2DDest.color = spr2DSrc.color;
  spr2DDest.type = spr2DSrc.type;
  spr2DDest.z = spr2DSrc.z;

  _nextSprite2DIndex++;
  if (_nextSprite2DIndex >= SPRITE_2D_POOL_SIZE) {
    _nextSprite2DIndex = 0;
  }
}
