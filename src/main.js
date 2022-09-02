// @ts-check

import * as Coin from './coin.js';
import * as Input from './input.js';
import * as Draw3D from './draw3d.js';
import * as Draw2D from './draw2d.js';
import * as Player from './player.js';
import * as Wall from './wall.js';
import * as Level from './level.js';
import * as Editor from './editor.js';

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
}

function update() {
  Wall.update();
  Player.update();
  Coin.update();
  Input.update();
  Draw3D.update();
  Draw2D.update();

  window.requestAnimationFrame(update);
}