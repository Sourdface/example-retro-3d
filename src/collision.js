// @ts-check

/**
 * @module collision
 *
 * Provides utilities for performing collision detection.
 */

import * as Geom from './geom.js';
import * as Draw3D from './draw3d.js';

/**
 * @type {Geom.Vector3D}
 */
const _tempVector3D = { x: 0, y: 0, z: 0 };

/**
 * Check for intersection between two rectangles, with optional offsets
 *
 * @param {Readonly<Geom.Box2D>} b1 Rectangle 1
 * @param {Readonly<Geom.Box2D>} b2 Rectangle 2
 * @param {Readonly<Geom.Vector2D>} [o1] Optional offset for b1
 * @param {Readonly<Geom.Vector2D>} [o2] Optional offset for b2
 * @param {Geom.Box2D} [resultIntersection] Resulting intersection rectangle. Only valid if true is returned.
 * @returns {boolean}
 */
export function rectIntersectBox2D(b1, b2, o1 = Geom.VECTOR_2D_0, o2 = Geom.VECTOR_2D_0, resultIntersection = _intersectBox2DDefaultResultIntersection) {
  Draw3D.getCellSize(_tempVector3D);

  const b1x1 = (b1.x + o1.x) * _tempVector3D.x;
  const b1y1 = (b1.y + o1.y) * _tempVector3D.y;
  const b1w = b1.w * _tempVector3D.x;
  const b1h = b1.h * _tempVector3D.y;

  const b2x1 = (b2.x + o2.x) * _tempVector3D.x;
  const b2y1 = (b2.y + o2.y) * _tempVector3D.y;
  const b2w = b2.w * _tempVector3D.x;
  const b2h = b2.h * _tempVector3D.y;

  const b1x2 = b1x1 + b1w;
  const b1y2 = b1y1 + b1h;
  const b2x2 = b2x1 + b2w;
  const b2y2 = b2y1 + b2h;

  if (b1x2 < b2x1 || b1x1 > b2x2 || b1y2 < b2y1 || b1y1 > b2y2) {
    return false;
  }

  resultIntersection.x = Math.max(b1x1, b2x1);
  resultIntersection.y = Math.max(b1y1, b2y1);
  resultIntersection.w = Math.min(b1x2, b2x2) - resultIntersection.x;
  resultIntersection.h = Math.min(b1y2, b2y2) - resultIntersection.y;

  return true;
}

/** @type {Geom.Box2D} */
const _intersectBox2DDefaultResultIntersection = { x: 0, y: 0, h: 0, w: 0 };

/**
 * Find `Box2D`'s that intersect with a given `Box2D`, with optional offset
 *
 * @param {Readonly<Geom.Box2D>} b1 Rectangle to check for intersection with
 * @param {readonly Readonly<Geom.Box2D>[]} boxes Rectangles to check against
 * @param {Readonly<Geom.Box2D>[]} resultRects Contains resulting rectangles. Only valid if true is returned.
 * @param {Readonly<Geom.Box2D>[]} resultIntersections Contains resulting intersection rectangles. Only valid if true is returned.
 * @param {Readonly<Geom.Vector2D>} [o1] Offset for b1
 * @param {(b1: Readonly<Geom.Box2D>, b2: Readonly<Geom.Box2D>, o1: Readonly<Geom.Vector2D>) => boolean} [filter] If provided, only consider rectangles that pass filter
 */
export function rectIntersectBox2Ds(b1, boxes, resultRects, o1 = Geom.VECTOR_2D_0, resultIntersections = _intersectBox2DsDefaultResultIntersections, filter = _returnTrue) {
  resultRects.length = 0;
  resultIntersections.length = 0;
  for (const b2 of boxes) {
    if (filter(b1, b2, o1)) {
      // TODO: Do not allocate new object; Use a pool of objects
      /** @type {Geom.Box2D} */
      const intersection = { x: 0, y: 0, h: 0, w: 0 };
      if (rectIntersectBox2D(b1, b2, o1, undefined, intersection)) {
        resultRects.push(b2);
        resultIntersections.push(intersection);
      }
    }
  }
}

/** @type {Readonly<Geom.Box2D>[]} */
const _intersectBox2DsDefaultResultIntersections = [];

/**
 * Return whether or not a vector is contained within a rectangle
 * @param {Readonly<Geom.Vector2D>} v
 * @param {Readonly<Geom.Box2D>} r
 */
export function vectorIntersectBox2D(v, r) {
  return (
    v.x >= r.x &&
    v.x <= r.x + r.w &&
    v.y >= r.y &&
    v.y <= r.y + r.h
  );
}

/**
 * Find rectangles that contain the given vector
 * @param {Readonly<Geom.Vector2D>} v Vector to check against
 * @param {readonly Readonly<Geom.Box2D>[]} boxes Rectangles to check against
 * @param {Readonly<Geom.Box2D>[]} resultBoxes Contains resulting rectangles. Only valid if true is returned.
 * @param {(v: Readonly<Geom.Vector2D>, b2: Readonly<Geom.Box2D>) => boolean} [filter] If provided, only consider rectangles that pass filter
 */
export function vectorIntersectBox2Ds(v, boxes, resultBoxes, filter = _returnTrue) {
  resultBoxes.length = 0;
  for (const b2 of boxes) {
    if (filter(v, b2)) {
      if (vectorIntersectBox2D(v, b2)) {
        resultBoxes.push(b2);
      }
    }
  }
}

function _returnTrue() {
  return true;
}

/** @type {Geom.Box3D} */
const _intersectBox3DDefaultResultIntersection = { x: 0, y: 0, h: 0, w: 0, z: 0, d: 0 };

/**
 * Check for intersection between two rectangles, with optional offsets
 *
 * @param {Readonly<Geom.Box3D>} b1 Rectangle 1
 * @param {Readonly<Geom.Box3D>} b2 Rectangle 2
 * @param {Readonly<Geom.Vector3D>} [o1] Optional offset for b1
 * @param {Readonly<Geom.Vector3D>} [o2] Optional offset for b2
 * @param {Geom.Box3D} [resultIntersection] Resulting intersection rectangle. Only valid if true is returned.
 * @returns {boolean}
 */
export function rectIntersectBox3D(b1, b2, o1 = Geom.VECTOR_3D_0, o2 = Geom.VECTOR_3D_0, resultIntersection = _intersectBox3DDefaultResultIntersection) {
  Draw3D.getCellSize(_tempVector3D);

  const b1x1 = (b1.x + o1.x) * _tempVector3D.x;
  const b1y1 = (b1.y + o1.y) * _tempVector3D.y;
  const b1z1 = (b1.z + o1.z) * _tempVector3D.z;
  const b1w = b1.w * _tempVector3D.x;
  const b1h = b1.h * _tempVector3D.y;
  const b1d = b1.d * _tempVector3D.z;

  const b2x1 = (b2.x + o2.x) * _tempVector3D.x;
  const b2y1 = (b2.y + o2.y) * _tempVector3D.y;
  const b2z1 = (b2.z + o2.z) * _tempVector3D.z;
  const b2w = b2.w * _tempVector3D.x;
  const b2h = b2.h * _tempVector3D.y;
  const b2d = b2.d * _tempVector3D.z;

  const b1x2 = b1x1 + b1w;
  const b1y2 = b1y1 + b1h;
  const b1z2 = b1z1 + b1d;
  const b2x2 = b2x1 + b2w;
  const b2y2 = b2y1 + b2h;
  const b2z2 = b2z1 + b2d;

  if (
    b1x2 < b2x1 ||
    b1x1 > b2x2 ||
    b1y2 < b2y1 ||
    b1y1 > b2y2 ||
    b1z2 < b2z1 ||
    b1z1 > b2z2
  ) {
    return false;
  }

  resultIntersection.x = Math.max(b1x1, b2x1);
  resultIntersection.y = Math.max(b1y1, b2y1);
  resultIntersection.z = Math.max(b1z1, b2z1);
  resultIntersection.w = Math.min(b1x2, b2x2) - resultIntersection.x;
  resultIntersection.h = Math.min(b1y2, b2y2) - resultIntersection.y;
  resultIntersection.d = Math.min(b1z2, b2z2) - resultIntersection.z;

  return true;
}

/** @type {Readonly<Geom.Box3D>[]} */
const _intersectBox3DsDefaultResultIntersections = [];

/**
 * Find `Box3D`'s that intersect with a given `Box3D`, with optional offset
 *
 * @param {Readonly<Geom.Box3D>} b1 Rectangle to check for intersection with
 * @param {readonly Readonly<Geom.Box3D>[]} boxes Rectangles to check against
 * @param {Readonly<Geom.Box3D>[]} resultRects Contains resulting rectangles. Only valid if true is returned.
 * @param {Readonly<Geom.Box3D>[]} resultIntersections Contains resulting intersection rectangles. Only valid if true is returned.
 * @param {Readonly<Geom.Vector3D>} [o1] Offset for b1
 * @param {(b1: Readonly<Geom.Box3D>, b2: Readonly<Geom.Box3D>, o1: Readonly<Geom.Vector3D>) => boolean} [filter] If provided, only consider rectangles that pass filter
 */
 export function rectIntersectBox3Ds(b1, boxes, resultRects, o1 = Geom.VECTOR_3D_0, resultIntersections = _intersectBox3DsDefaultResultIntersections, filter = _returnTrue) {
  resultRects.length = 0;
  resultIntersections.length = 0;
  for (const b2 of boxes) {
    if (filter(b1, b2, o1)) {
      // TODO: Do not allocate new object; Use a pool of objects
      /** @type {Geom.Box3D} */
      const intersection = { x: 0, y: 0, h: 0, w: 0, z: 0, d: 0 };
      if (rectIntersectBox3D(b1, b2, o1, undefined, intersection)) {
        resultRects.push(b2);
        resultIntersections.push(intersection);
      }
    }
  }
}