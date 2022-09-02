// @ts-check

/**
 * @module Main
 *
 * Entry point for the app containing the main update loop.
 *
 * Most work is offloaded to other modules. This file mainly serves to
 */

import * as Coin from './coin.js';
import * as Draw2D from './draw2d.js';
import * as Draw3D from './draw3d.js';
import * as Editor from './editor.js';
import * as Input from './input.js';
import * as Level from './level.js';
import * as Player from './player.js';
import * as Wall from './wall.js';

/**
 * Application entry point.
 */
window.onload = () => {
  Draw2D.setup();
  Draw3D.setup();
  Input.setup();
  Wall.setup();
  Player.setup();
  Coin.setup();
  Level.setup();
  Editor.setup();

  update();
};

/**
 * Main update loop body.
 *
 * This function runs once per frame. It is responsible for calling the
 * update functions for all other modules that need it.
 */
function update() {
  Input.preUpdate();

  Wall.update();
  Player.update();
  Coin.update();
  Input.update();
  Draw3D.update();
  Draw2D.update();

  window.requestAnimationFrame(update);
}
