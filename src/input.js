// @ts-check

/**
 * @module input
 *
 * Provides an interface to user input state.
 */

/**
 * @typedef InputState
 *
 * State of a specific individual input.
 *
 * @prop {boolean} pressed Whether the input is currently pressed.
 * @prop {boolean} pressedPrevious Whether the input was pressed in the previous frame.
 * @prop {boolean} justPressed Whether the input was just pressed in the current frame.
 * @prop {boolean} justReleased Whether the input was just released in the current frame.
 */

/**
 * @typedef InputStates
 *
 * State for each user input.
 *
 * @prop {InputState} left
 * @prop {InputState} right
 * @prop {InputState} up
 * @prop {InputState} down
 * @prop {InputState} a
 */

/**
 * Maps key codes to input names.
 *
 * @type {{ [key: string]: keyof InputStates }}
 */
export const keyInputs = {
  'ArrowLeft': 'left',
  'ArrowRight': 'right',
  'ArrowUp': 'up',
  'ArrowDown': 'down',
  ' ': 'a',
}

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
 * User input state for the current frame.
 *
 * @type {Readonly<{[K in keyof InputStates]: Readonly<InputStates[K]>}>}
 */
export const state = {
  left: { ..._DEFAULT_INPUT_STATE },
  right: { ..._DEFAULT_INPUT_STATE },
  up: { ..._DEFAULT_INPUT_STATE },
  down: { ..._DEFAULT_INPUT_STATE },
  a: { ..._DEFAULT_INPUT_STATE },
}

export function setup() {
  window.addEventListener('keydown', _onKeyDown);
  window.addEventListener('keyup', _onKeyUp);
}

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

export function update() {
  for (const key in state) {
    /** @type {InputState} */
    const input = state[key];
    input.justPressed = !input.pressedPrevious && input.pressed;
    input.justReleased = input.pressedPrevious && !input.pressed;
    input.pressedPrevious = input.pressed;
  }
}
