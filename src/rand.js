/**
  * Pick a random element from the given array
  * @template T Type of the array elements
  * @param {T[]} arr Array to pick from
  */
export function arrayPick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}