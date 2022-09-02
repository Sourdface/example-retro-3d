// @ts-check

import * as draw from './draw.js';
import * as geom from './geom.js';
import * as collision from './collision.js';
import * as player from './player.js';
import * as wall from './wall.js';
import * as coin from './coin.js';

let _mode = 0;

/**
 * @type {geom.Vector2D}
 */
let _mouseDownPos = { x: 0, y: 0 };

let _mouseDown = false;

let _objectIndex = 0;

export function setup() {
  window.addEventListener('mousedown', _onMouseDown);
  window.addEventListener('mouseup', _onMouseUp);
  window.addEventListener('mousemove', _onMouseMove);
  window.addEventListener('keydown', _onKeyDown);

  draw.canvas.addEventListener('contextmenu', e => e.preventDefault());
}

/**
 * @param {MouseEvent} e
 */
function _onMouseDown(e) {
  e.preventDefault();

  const canvasBox = draw.canvas.getBoundingClientRect();
  _mouseDownPos.x = (Math.max((e.offsetX / canvasBox.width * draw.gridSize.x) + draw.viewOffset.x, draw.viewOffset.x)) | 0;
  _mouseDownPos.y = (Math.max((e.offsetY / canvasBox.height * draw.gridSize.y) + draw.viewOffset.y, draw.viewOffset.y)) | 0;

  button: switch (e.button) {
    case 0:
      _mouseDown = true;
      mode: switch (_mode) {
        case 1:
          player.set(_mouseDownPos.x, _mouseDownPos.y);
          break mode;

        case 2:
          _objectIndex = wall.next();
          if (_objectIndex < 0) {
            break mode;
          }
          wall.set(_objectIndex, _mouseDownPos.x, _mouseDownPos.y, 0, 1, 1, 3, true, true);
          break mode;

        case 3:
          _objectIndex = coin.next();
          if (_objectIndex < 0) {
            break mode;
          }
          coin.set(_objectIndex, _mouseDownPos.x, _mouseDownPos.y, 0);
          break mode;
      }
      break button;

    case 2:
      collision.vectorIntersectBox2Ds(_mouseDownPos, wall.walls, _onMouseDownDeleteRects);
      for (let i = 0; i < _onMouseDownDeleteRects.length; i++) {
        const wall = /** @type {wall.Wall} */ (_onMouseDownDeleteRects[i]);
        wall.solid = false;
        wall.visible = false;
      }
      collision.vectorIntersectBox2Ds(_mouseDownPos, coin.coins, _onMouseDownDeleteRects);
      for (let i = 0; i < _onMouseDownDeleteRects.length; i++) {
        const coin = /** @type {coin.Coin} */ (_onMouseDownDeleteRects[i]);
        coin.enabled = false;
      }
      break button;
  }
}

/**
 * @type {geom.Box3D[]}
 */
const _onMouseDownDeleteRects = [];

/**
 * @param {MouseEvent} e
 */
function _onMouseUp(e) {
  _mouseDown = false;
}

/**
 * @param {MouseEvent} e
 */
function _onMouseMove(e) {
  if (!_mouseDown) {
    return;
  }

  const canvasBox = draw.canvas.getBoundingClientRect();
  const mouseX = (Math.max((e.offsetX / canvasBox.width * draw.gridSize.x) + draw.viewOffset.x, draw.viewOffset.x)) | 0;
  const mouseY = (Math.max((e.offsetY / canvasBox.height * draw.gridSize.y) + draw.viewOffset.y, draw.viewOffset.y)) | 0;

  mode: switch (_mode) {
    case 1:
      player.set(mouseX, mouseY);
      break mode;

    case 2:
      if (_objectIndex < 0) {
        break mode;
      }
      wall.walls[_objectIndex].w = Math.max(mouseX - _mouseDownPos.x, 1);
      wall.walls[_objectIndex].h = Math.max(mouseY - _mouseDownPos.y, 1);
      break mode;

    case 3:
      if (_objectIndex < 0) {
        break mode;
      }
      coin.coins[_objectIndex].x = mouseX;
      coin.coins[_objectIndex].y = mouseY;
      break mode;
  }
}

/**
 * @param {KeyboardEvent} e
 */
function _onKeyDown(e) {
  if (_mouseDown) {
    return;
  }

  switch (e.key) {
    case '1':
      _mode = 1;
      break;

    case '2':
      _mode = 2;
      break;

    case '3':
      _mode = 3;
      break;

    case '0':
      _mode = 0;
      break;
  }
}
