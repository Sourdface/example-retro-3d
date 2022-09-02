// @ts-check

/**
 * Represents a unitless offset from an origin within a 2-dimensional space
 *
 * @exports Vector2D
 * @typedef Vector2D
 * @prop {number} x Scalar component representing the 1st dimension of the
 * offset of the vector
 * @prop {number} y Scalar component representing the 2nd dimension of the
 * offset of the vector
 */

/**
 * Represents a unitless offset from an origin within a 3-dimensional space
 *
 * @exports Vector3D
 * @typedef {Vector2D & _Vector3D} Vector3D
 * @typedef _Vector3D
 * @prop {number} z Scalar component representing the 3rd dimension of the
 * offset of the vector
 */

/**
 * Represents a unitless spatial range relative to an origin in 2-dimensional
 * space.
 *
 * @exports Box2D
 * @typedef {Vector2D & _Box2D} Box2D
 * @typedef _Box2D
 * @prop {number} w Offset relative to the x component of the vector which
 * terminates the box's range along the x dimension, ie. the box's width.
 * @prop {number} h Offset relative to the y component of the vector which
 * terminates the box's range along the y dimension, ie. the box's height.
 */

/**
 * Represents a unitless spatial range relative to an origin in 3-dimensional
 * space.
 *
 * @exports Box3D
 * @typedef {Box2D & Vector3D & _Box3D} Box3D
 * @typedef _Box3D
 * @prop {number} d Offset relative to the z component of the vector which
 * terminates the box's range along the z dimension, ie. the box's depth.
 */

/**
 * Vector representing the origin of a 2-dimensional space
 *
 * @type {Readonly<Vector2D>}
 */
export const VECTOR_2D_0 = { x: 0, y: 0 };

/**
 * Vector representing the origin of a 3-dimensional space
 * @type {Readonly<Vector3D>}
 */
export const VECTOR_3D_0 = { x: 0, y: 0, z: 0 };
