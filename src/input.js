// @ts-check

/**
 * @module input
 *
 * Provides an interface to user input state.
 */

/**
 * State of a specific individual input.
 *
 * @exports InputState
 * @typedef InputState
 * @prop {boolean} pressed Whether the input is currently pressed.
 * @prop {boolean} pressedPrevious Whether the input was pressed in the previous frame.
 * @prop {boolean} justPressed Whether the input was just pressed in the current frame.
 * @prop {boolean} justReleased Whether the input was just released in the current frame.
 */

/**
 * State for each user input.
 *
 * @exports InputStates
 * @typedef InputStates
 * @prop {InputState} left
 * @prop {InputState} right
 * @prop {InputState} up
 * @prop {InputState} down
 * @prop {InputState} a
 * @prop {InputState} b
 */

/**
 * @type {Readonly<InputState>}
 */
const _DEFAULT_INPUT_STATE = {
  pressed: false,
  pressedPrevious: false,
  justPressed: false,
  justReleased: false,
};

/**
 * @type {Gamepad|null}
 */
let _gamepad = null;

/**
 * Maps key codes to input names.
 *
 * @type {{ [key: string]: keyof InputStates }}
 */
export const keyInputs = {
  ArrowLeft: 'left',
  ArrowRight: 'right',
  ArrowUp: 'up',
  ArrowDown: 'down',
  ' ': 'a',
};

/**
 * @type {{ [key: number]: keyof InputStates }}
 */
export const gamepadButtonInputs = {
  0: 'a',
  1: 'b',
  12: 'up',
  13: 'down',
  14: 'left',
  15: 'right',
};

/**
 * User input state for the current and previous frames.
 *
 * @type {Readonly<{[K in keyof InputStates]: Readonly<InputStates[K]>}>}
 */
export const state = {
  left: { ..._DEFAULT_INPUT_STATE },
  right: { ..._DEFAULT_INPUT_STATE },
  up: { ..._DEFAULT_INPUT_STATE },
  down: { ..._DEFAULT_INPUT_STATE },
  a: { ..._DEFAULT_INPUT_STATE },
  b: { ..._DEFAULT_INPUT_STATE },
};

/**
 * @param {KeyboardEvent} e
 */
function _onKeyDown(e) {
  if (e.key in keyInputs) {
    /** @type {InputState} */ (state[keyInputs[e.key]]).pressed = true;
  }
}

/**
 * @param {KeyboardEvent} e
 */
function _onKeyUp(e) {
  if (e.key in keyInputs) {
    /** @type {InputState} */ (state[keyInputs[e.key]]).pressed = false;
  }
}

/**
 *
 * @param {GamepadEvent} e
 */
function _onGamepadConnected(e) {
  if (!_gamepad) {
    _gamepad = e.gamepad;
  }
}

/**
 * @param {GamepadEvent} e
 */
function _onGamepadDisconnected(e) {

}

export function setup() {
  window.addEventListener('keydown', _onKeyDown);
  window.addEventListener('keyup', _onKeyUp);
  window.addEventListener('gamepadconnected', _onGamepadConnected);
  window.addEventListener('gamepaddisconnected', _onGamepadDisconnected);
}

/**
 * Runs once per frame for this module, but before `update()` for this or any other module is called.
 */
export function preUpdate() {
  if (!_gamepad) {
    return;
  }
  for (const gamepad of navigator.getGamepads()) {
    if (!gamepad || gamepad.index !== _gamepad.index) {
      continue;
    }

    for (const btnId in gamepadButtonInputs) {
      if (!(btnId in gamepad.buttons)) {
        continue;
      }
      /** @type {InputState} */ (state[gamepadButtonInputs[btnId]])
        .pressed = gamepad.buttons[btnId].pressed;
    }
  }
}

/**
 * Runs once per frame for this module
 */
export function update() {
  for (const key in state) {
    if (!state[key]) {
      continue;
    }
    /** @type {InputState} */
    const input = state[key];
    input.justPressed = !input.pressedPrevious && input.pressed;
    input.justReleased = input.pressedPrevious && !input.pressed;
    input.pressedPrevious = input.pressed;
  }
}
