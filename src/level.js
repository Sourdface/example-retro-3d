// @ts-check

import * as Wall from './wall.js'
import * as Coin from './coin.js'
import * as Draw from './draw2d.js'

export function setup () {
  Wall.set(Wall.next(), 0, 0, 16, Draw.gridSize.x, Draw.gridSize.y, 1, true, true)
  Wall.set(Wall.next(), 0, 0, 0, Draw.gridSize.x, 1, 16, true, true)
  Wall.set(Wall.next(), 0, 0, 0, 1, Draw.gridSize.y, 16, true, true)
  Wall.set(Wall.next(), Draw.gridSize.x - 1, 0, 0, 1, Draw.gridSize.y, 16, true, true)
  Wall.set(Wall.next(), 0, Draw.gridSize.y - 1, 0, Draw.gridSize.x, 1, 16, true, true)
  Wall.set(Wall.next(), 0, 0, -1, Draw.gridSize.x, Draw.gridSize.y, 1, true, false)

  Wall.set(Wall.next(), 8, 6, 0, 4, 1, 3, true, true)
  Wall.set(Wall.next(), 14, 10, 0, 4, 1, 3, true, true)
  Wall.set(Wall.next(), 10, 14, 0, 4, 3, 8, true, true)

  Wall.set(Wall.next(), 24, 14, 8, 4, 4, 8, true, true)

  Coin.set(Coin.next(), 9, 10, 9)
  Coin.set(Coin.next(), 5, 2, 0)
  Coin.set(Coin.next(), 16, 8, 0)
  Coin.set(Coin.next(), 12, 12, 0)
  Coin.set(Coin.next(), 24, 10, 0)
  Coin.set(Coin.next(), 26, 6, 12)
  Coin.set(Coin.next(), 18, 14, 4)
}

export function update () {

}
