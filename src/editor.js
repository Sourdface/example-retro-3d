// @ts-check

import * as Draw2D from './draw2d.js';
import * as Draw3D from './draw3d.js';
import * as Geom from './geom.js';
import * as Collision from './collision.js';
import * as Player from './player.js';
import * as Wall from './wall.js';
import * as Coin from './coin.js';

let _mode = 0;

/**
 * @type {Geom.Vector2D}
 */
let _mouseDownPos = { x: 0, y: 0 };

let _mouseDown = false;

let _objectIndex = 0;

export function setup() {
  window.addEventListener('mousedown', _onMouseDown);
  window.addEventListener('mouseup', _onMouseUp);
  window.addEventListener('mousemove', _onMouseMove);
  window.addEventListener('keydown', _onKeyDown);

  Draw2D.canvas.addEventListener('contextmenu', e => e.preventDefault());
}

/**
 * @param {MouseEvent} e
 */
function _onMouseDown(e) {
  e.preventDefault();

  const canvasBox = Draw2D.canvas.getBoundingClientRect();
  _mouseDownPos.x = (Math.max((e.offsetX / canvasBox.width * Draw2D.gridSize.x) + Draw3D.viewOffset.x, Draw3D.viewOffset.x)) | 0;
  _mouseDownPos.y = (Math.max((e.offsetY / canvasBox.height * Draw2D.gridSize.y) + Draw3D.viewOffset.y, Draw3D.viewOffset.y)) | 0;

  button: switch (e.button) {
    case 0:
      _mouseDown = true;
      mode: switch (_mode) {
        case 1:
          Player.set(_mouseDownPos.x, _mouseDownPos.y);
          break mode;

        case 2:
          _objectIndex = Wall.next();
          if (_objectIndex < 0) {
            break mode;
          }
          Wall.set(_objectIndex, _mouseDownPos.x, _mouseDownPos.y, 0, 1, 1, 3, true, true);
          break mode;

        case 3:
          _objectIndex = Coin.next();
          if (_objectIndex < 0) {
            break mode;
          }
          Coin.set(_objectIndex, _mouseDownPos.x, _mouseDownPos.y, 0);
          break mode;
      }
      break button;

    case 2:
      Collision.vectorIntersectBox2Ds(_mouseDownPos, Wall.walls, _onMouseDownDeleteRects);
      for (let i = 0; i < _onMouseDownDeleteRects.length; i++) {
        const wall = /** @type {Wall.Wall} */ (_onMouseDownDeleteRects[i]);
        wall.solid = false;
        wall.visible = false;
      }
      Collision.vectorIntersectBox2Ds(_mouseDownPos, Coin.coins, _onMouseDownDeleteRects);
      for (let i = 0; i < _onMouseDownDeleteRects.length; i++) {
        const coin = /** @type {Coin.Coin} */ (_onMouseDownDeleteRects[i]);
        coin.enabled = false;
      }
      break button;
  }
}

/**
 * @type {Geom.Box3D[]}
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

  const canvasBox = Draw2D.canvas.getBoundingClientRect();
  const mouseX = (Math.max((e.offsetX / canvasBox.width * Draw2D.gridSize.x) + Draw3D.viewOffset.x, Draw3D.viewOffset.x)) | 0;
  const mouseY = (Math.max((e.offsetY / canvasBox.height * Draw2D.gridSize.y) + Draw3D.viewOffset.y, Draw3D.viewOffset.y)) | 0;

  mode: switch (_mode) {
    case 1:
      Player.set(mouseX, mouseY);
      break mode;

    case 2:
      if (_objectIndex < 0) {
        break mode;
      }
      Wall.walls[_objectIndex].w = Math.max(mouseX - _mouseDownPos.x, 1);
      Wall.walls[_objectIndex].h = Math.max(mouseY - _mouseDownPos.y, 1);
      break mode;

    case 3:
      if (_objectIndex < 0) {
        break mode;
      }
      Coin.coins[_objectIndex].x = mouseX;
      Coin.coins[_objectIndex].y = mouseY;
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
