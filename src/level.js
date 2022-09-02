// @ts-check

import * as wall from "./wall.js";
import * as coin from "./coin.js";
import * as draw from "./draw.js";

export function setup() {
  wall.set(wall.next(), 0, 0, 16, draw.gridSize.x, draw.gridSize.y, 1, true, true);
  wall.set(wall.next(), 0, 0, 0, draw.gridSize.x, 1, 16, true, true);
  wall.set(wall.next(), 0, 0, 0, 1, draw.gridSize.y, 16, true, true);
  wall.set(wall.next(), draw.gridSize.x - 1, 0, 0, 1, draw.gridSize.y, 16, true, true);
  wall.set(wall.next(), 0, draw.gridSize.y - 1, 0, draw.gridSize.x, 1, 16, true, true);
  wall.set(wall.next(), 0, 0, -1, draw.gridSize.x, draw.gridSize.y, 1, true, false);

  wall.set(wall.next(), 8, 6, 0, 4, 1, 3, true, true);
  wall.set(wall.next(), 14, 10, 0, 4, 1, 3, true, true);
  wall.set(wall.next(), 10, 14, 0, 4, 3, 8, true, true);

  wall.set(wall.next(), 24, 14, 8, 4, 4, 8, true, true);

  coin.set(coin.next(), 9, 10, 9);
  coin.set(coin.next(), 5, 2, 0);
  coin.set(coin.next(), 16, 8, 0);
  coin.set(coin.next(), 12, 12, 0);
  coin.set(coin.next(), 24, 10, 0);
  coin.set(coin.next(), 26, 6, 12);
  coin.set(coin.next(), 18, 14, 4);
}