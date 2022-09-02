// @ts-check

import * as coin from './coin.js';
import * as input from './input.js';
import * as draw from './draw.js';
import * as player from './player.js';
import * as wall from './wall.js';
import * as level from './level.js';
import * as editor from './editor.js';

window.onload = () => {
  draw.setup();
  input.setup();
  wall.setup();
  player.setup();
  coin.setup();

  level.setup();

  editor.setup();

  update();
}

function update() {
  wall.update();
  player.update();
  coin.update();
  input.update();
  draw.update();

  window.requestAnimationFrame(update);
}