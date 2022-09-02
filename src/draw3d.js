// @ts-check

import * as Debug from './debug.js';
import * as Geom from './geom.js';
import * as Color from './color.js';
import * as Draw2D from './draw2d.js';

/**
 * Describes a 3D visual element that can be drawn to the screen
 *
 * @exports Sprite3D
 * @typedef {Geom.Box3D & Omit<Draw2D.Sprite2D, 'layerId'>} Sprite3D
 */

/**
 * Maximum number of `Sprite3D`'s that can be drawn per cycle, and max number of
 * `Sprite2D`'s per layer.
 */
export const SPRITE_3D_POOL_SIZE = 4096;

let _cellSizeZ = 4;

let _gridSizeZ = 32;

/**
 * @type {Geom.Vector3D}
 */
const _tempVector3D = { x: 0, y: 0, z: 0 };

/**
 * Pool of pre-allocated `Sprite3D`'s
 *
 * @type {readonly Sprite3D[]}
 */
const _sprite3DPool = Array.from(Array(SPRITE_3D_POOL_SIZE))
  .map(() => /** @type {Sprite3D} */({ x: 0, y: 0, z: 0, w: 0, h: 0, d: 0, color: 0xFFFF, type: 0 }));

/**
 * Index of next `Sprite3D` from the pool to be queued
 */
let _nextSprite3DIndex = 0;

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
 * A value of 180 / Math.PI (1 radian) will project objects 1 unit away from the
 * camera at 1:1 scale.
 */
export let fov = 180 / Math.PI / 24;

/**
 * Scale factor of fog effect
 */
export let fogPower = 0.044;

export let fogOffset = 1.006;

/**
 * Objects drawn to be at a z distance less than this from the camera will not be drawn.
 */
export let zNear = 5;

export function setup() {

}

export function update() {
  const fovR = fov * Math.PI / 180;

  const gridCX = Draw2D.gridSize.x * 0.5;
  const gridCY = Draw2D.gridSize.y * 0.5;
  const gridCZ = _gridSizeZ * 0.5;

  const vOffX = -(viewOffset.x + gridCX);
  const vOffY = -(viewOffset.y + gridCY);
  const vOffZ = (viewOffset.z + gridCZ);

  for (const spr3D of _sprite3DPool) {
    if (!spr3D.w || !spr3D.h || !spr3D.d) {
      continue;
    }

    const spr3DX1 = spr3D.x + vOffX;
    const spr3DY1 = spr3D.y + vOffY;
    const spr3DZ1 = spr3D.z + vOffZ;

    const spr3DX2 = spr3DX1 + spr3D.w;
    const spr3DY2 = spr3DY1 + spr3D.h;

    const layerCount = spr3D.d * _cellSizeZ;

    for (let i = 0; i < layerCount; i++) {
      const spr2DZ1 = spr3DZ1 + i / _cellSizeZ;

      if (spr2DZ1 < zNear) {
        continue;
      }

      const zScale = 1 / spr2DZ1 / fovR;

      const spr2DX1 = spr3DX1 * zScale;
      const spr2DY1 = spr3DY1 * zScale;

      const spr2DX2 = spr3DX2 * zScale;
      const spr2DY2 = spr3DY2 * zScale;

      const spr2D = Draw2D.queueSprite2D();

      spr2D.x = spr2DX1 + gridCX;
      spr2D.y = spr2DY1 + gridCY;
      spr2D.z = spr2DZ1;
      spr2D.w = spr2DX2 - spr2DX1;
      spr2D.h = spr2DY2 - spr2DY1;

      const fog = (1 - spr2D.z * fogPower) + fogOffset;
      spr2D.color = Color.mpalMult(spr3D.color, fog, fog, fog);

      spr2D.type = spr3D.type;
    }

    spr3D.w = 0;
  }
}

/**
 * @param {Geom.Vector3D} size
 */
export function getCellSize(size) {
  size.x = Draw2D.cellSize.x;
  size.y = Draw2D.cellSize.y;
  size.z = _cellSizeZ;
}

/**
 * @param {Geom.Vector3D} size
 */
export function setCellSize(size) {
  Draw2D.cellSize.x = size.x;
  Draw2D.cellSize.y = size.y;
  _cellSizeZ = size.z;
}

/**
 * @param {Geom.Vector3D} size
 */
export function getGridSize(size) {
  size.x = Draw2D.gridSize.x;
  size.y = Draw2D.gridSize.y;
  size.z = _gridSizeZ;
}

/**
 * @param {Geom.Vector3D} size
 */
export function setGridSize(size) {
  Draw2D.gridSize.x = size.x;
  Draw2D.gridSize.y = size.y;
  _gridSizeZ = size.z;
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


Debug.onKeyDown(']', () => {
  Draw2D.cellSize.x += 1;
  Draw2D.cellSize.y = Draw2D.cellSize.x;
  _cellSizeZ = Draw2D.cellSize.x;
});

Debug.onKeyDown('[', () => {
  Draw2D.cellSize.x -= 1;
  Draw2D.cellSize.y = Draw2D.cellSize.x;
  _cellSizeZ = Draw2D.cellSize.x;
});

Debug.onKeyDown('-', () => {
  fov -= 0.2;
});

Debug.onKeyDown('=', () => {
  fov += 0.2;
});

Debug.onKeyDown(',', () => {
  viewOffset.z -= 0.2;
});

Debug.onKeyDown('.', () => {
  viewOffset.z += 0.2;
});

Debug.onKeyDown(';', () => {
  fogPower -= 0.01;
});

Debug.onKeyDown('\'', () => {
  fogPower += 0.01;
})