// @ts-check

import * as Draw3D from './draw3d.js'
import * as Input from './input.js'
import * as Collision from './collision.js'
import * as Wall from './wall.js'

/**
 * @typedef {Draw3D.Sprite3D & _Player} Player
 * @typedef _Player
 * @prop {number} ay - Acceleration in the y direction.
 * @prop {number} jumpPower - Power of the jump.
 * @prop {number} vy - Velocity in the y direction.
 * @prop {number} vyAirbrake - Min vertical speed to which the player is slowed
 * after releasing the jump button while moving upwards.
 * @prop {number} vyMax - Maximum velocity in the y direction.
 * @prop {number} walkSpeed - Speed of the player when walking.
 *
 * @exports Player
 */

/**
 * @type {import('./geom.js').Vector3D}
 */
const _tempVector3D = { x: 0, y: 0, z: 0 }

/**
 * @type {Player}
 */
export const player = {
  ay: 1 / 40,
  color: 0b111_011_000,
  d: 1.25,
  h: 3,
  jumpPower: 1 / 2,
  type: 1,
  vy: 0,
  vyAirbrake: -1 / 8,
  vyMax: 1 / 2,
  w: 1.25,
  walkSpeed: 1 / 8,
  x: 3,
  y: 8,
  z: 0
}

/**
 * Track whether the player is on the floor below.
 */
let _isOnFloor = false

/**
 * List of walls that are colliding with the player.
 *
 * @type {Readonly<Wall.Wall>[]}
 */
const _wallsColliding = []

/**
 * List of of the intersections of the player with walls.
 *
 * @type {import('./geom.js').Box3D[]}
 */
const _wallIntersections = []

export function setup () { }

/**
 * Set the state of the player to a new initial state.
 *
 * @param {number} x
 * @param {number} y
 */
export function set (x, y) {
  player.x = x
  player.y = y
  player.vy = 0
}

export function update () {
  _updateInput()
  _updatePhysics()
  Draw3D.queueSprite3D(player)
}

function _updateInput () {
  Draw3D.getCellSize(_tempVector3D)

  if (Input.state.left.pressed && !Input.state.right.pressed) {
    player.x -= player.walkSpeed
  } else if (Input.state.right.pressed && !Input.state.left.pressed) {
    player.x += player.walkSpeed
  } else {
    player.x = (Math.round(player.x * _tempVector3D.x)) / _tempVector3D.x
  }

  if (Input.state.down.pressed && !Input.state.up.pressed) {
    player.z -= player.walkSpeed
  } else if (Input.state.up.pressed && !Input.state.down.pressed) {
    player.z += player.walkSpeed
  } else {
    player.z = (Math.round(player.z * _tempVector3D.z)) / _tempVector3D.z
  }

  if (_isOnFloor) {
    if (Input.state.a.justPressed) {
      player.vy = -player.jumpPower
    }
  } else if (Input.state.a.justReleased && player.vy < player.vyAirbrake) {
    player.vy = player.vyAirbrake
  }
  _isOnFloor = false
}

/**
 * Apply physics to the player.
 *
 * Collision resolution is based on the idea that mobile objects should always
 * be moved to the outside of static objects during a collision. The shortest
 * path is taken to get out of the collision, but only one dimension of the
 * mobile object's coordinates should be updated for any given collision. An
 * assumption is made that the narrower dimension of the intersection between a
 * mobile object and a static object is the one that correlates with the primary
 * axis of the collision, which is the axis that the mobile object was assumed
 * to be moving along in order to collide with the static object. It is also
 * assumed that the sign of the difference between the mobile object's
 * centerpoint and the static object's centerpoint indicates the direction of
 * the collision along the primary axis. Using these assumptions, the mobile
 * object's coordinates are updated to the outside of the static object's area
 * in one of the four cardinal directions.
 */
function _updatePhysics () {
  player.vy = Math.min(player.vy + player.ay, player.vyMax)
  player.y += player.vy

  Collision.rectIntersectBox3Ds(
    player,
    Wall.walls,
    _wallsColliding,
    undefined,
    _wallIntersections,
    _updateWallCollisionsFilter
  )

  for (let i = 0; i < _wallsColliding.length; i++) {
    const colWall = _wallsColliding[i]
    const colIntersection = _wallIntersections[i]

    const playerCx = player.x + player.w * 0.5
    const playerCy = player.y + player.h * 0.5
    const playerCz = player.z + player.d * 0.5

    const wallCx = colWall.x + colWall.w * 0.5
    const wallCy = colWall.y + colWall.h * 0.5
    const wallCz = colWall.z + colWall.d * 0.5

    if (colIntersection.w > colIntersection.h && colIntersection.d > colIntersection.h) {
      if (playerCy < wallCy) {
        _isOnFloor = true
        player.y = colWall.y - player.h
        if (player.vy > 0) {
          player.vy = 0
        }
      } else {
        player.y = colWall.y + colWall.h
        if (player.vy < 0) {
          player.vy = 0
        }
      }
    } else if (colIntersection.d > colIntersection.w) {
      if (playerCx < wallCx) {
        player.x = colWall.x - player.w
      } else {
        player.x = colWall.x + colWall.w
      }
    } else if (playerCz < wallCz) {
      player.z = colWall.z - player.d
    } else {
      player.z = colWall.z + colWall.d
    }
  }
}

/**
 * @param {Readonly<import('./geom.js').Box3D>} r1
 * @param {Readonly<import('./geom.js').Box3D>} r2
 * @param {Readonly<import('./geom.js').Vector3D>} o1
 */
function _updateWallCollisionsFilter (r1, r2, o1) {
  return /** @type {Wall.Wall} */ (r2).solid
}
