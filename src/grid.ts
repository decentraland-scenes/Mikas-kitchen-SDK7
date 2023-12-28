// import { Entity, Transform, engine } from "@dcl/sdk/ecs"
// import { Vector3 } from "@dcl/sdk/math"
// import { GridPosition, TileType } from "./definitions"

// // instance grid
// let shelvesHeight: number[][] = [
//   [0, 0, 1, 1, 1, 1, 1, 1],
//   [0, 0, 0, 0, 0, 0, 0, 1],
//   [0, 0, 0, 0, 0, 0, 0, 1],
//   [0, 0, 0, 0, 0, 0, 0, 1],
//   [0, 0, 0, 0, 0, 0, 0, 1],
//   [1, 1, 1, 1, 1, 1, 1, 1],
// ]

// let gridStartingPosition = Vector3.create(13.5, 0.1, 6.5)
// let xMax = 6
// let zMax = 9

// //let shelves = new gridObject(gridStartingPosition, xMax, zMax, shelvesHeight)

// //import { CuttingBoard } from './cuttingBoard'



// // component group grid positions
// export const gridPositions = engine.getEntitiesWith(GridPosition)

// export class gridObject {
//   grid: Entity[][]
//   gridStartingPosition: Vector3
//   xMax: number
//   zMax: number
//   shelvesHeight: number[][]
//   constructor(
//     gridStartingPosition: Vector3,
//     xMax: number,
//     zMax: number,
//     shelvesHeight: number[][]
//   ) {
//     ; (this.gridStartingPosition = gridStartingPosition),
//       (this.xMax = xMax),
//       (this.zMax = zMax)
//     this.shelvesHeight = shelvesHeight
//     this.grid = new Array(shelvesHeight.length)
//     for (let index = 0; index < this.shelvesHeight.length; index++) {
//       this.grid[index] = new Array(this.shelvesHeight[index].length)
//     }

//     for (let x = 0; x < this.xMax; x++) {
//       for (let z = 0; z < this.zMax; z++) {
//         let shelf = engine.addEntity()
//         let y = this.shelvesHeight[x][z]
//         Transform.create(shelf, {
//           position: Vector3.create(
//             gridStartingPosition.x + x,
//             gridStartingPosition.y + y,
//             gridStartingPosition.z + z
//           ),
//         })
//         GridPosition.create(shelf)
//         this.grid[x][z] = shelf

//         // let testEnt = new Entity()
//         // testEnt.setParent(shelf)
//         // testEnt.addComponent(new BoxShape())
//         // testEnt.addComponent(
//         //   new Transform({
//         //     scale: new Vector3(0.05, 0.05, 0.05)
//         //   })
//         // )
//         // engine.addEntity(testEnt)
//       }
//     }
//   }
// }

// export function getClosestShelf(position: Vector3, gridObject: gridObject) {
//   //direction.y = 0

//   /*log(
//     "incoming position: " +
//       new Vector3().copyFrom(position).subtract(gridStartingPosition)
//   )
//   log("incoming direction: " + direction)*/

//   let finalPositionToCheck: Vector3 = Vector3.create(position.x, 0, position.z)

//   // log("final position to check: " + finalPositionToCheck)

//   let gridPosition: Vector3 = GetGridPosition(finalPositionToCheck, gridObject)
//   // log("grid position: " + gridPosition)



//   if (
//     GridPosition.get(gridObject.grid[gridPosition.x][gridPosition.y]) &&
//     GridPosition.get(gridObject.grid[gridPosition.x][gridPosition.y]).type !== TileType.Cutter
//   ) {
//     console.log('position already occupied')
//     return null
//   }

//   return gridObject.grid[gridPosition.x][gridPosition.y]
// }

// // Get distance
// /* 
//   Note:
//   This function really returns distance squared, as it's a lot more efficient to calculate.
//   The square root operation is expensive and isn't really necessary if we compare the result to squared values.
//   We also use {x,z} not {x,y}. The y-coordinate is how high up it is.
//   */
// export function distance(pos1: Vector3, pos2: Vector3): number {
//   const a = pos1.x - pos2.x
//   const b = pos1.z - pos2.z
//   return a * a + b * b
// }

// export function GetGridPosition(
//   worldPosition: Vector3,
//   gridObject: gridObject
// ) {
//   let gridPosition = Vector3.create()

//   let adjustedPosition = Vector3.subtract(worldPosition, gridObject.gridStartingPosition)

//   if (adjustedPosition.x < 0) {
//     adjustedPosition.x = 0
//   } else if (adjustedPosition.x >= gridObject.grid.length) {
//     adjustedPosition.x = gridObject.grid.length - 1
//   }

//   if (adjustedPosition.z < 0) {
//     adjustedPosition.z = 0
//   } else if (adjustedPosition.z >= gridObject.grid[0].length) {
//     adjustedPosition.z = gridObject.grid[0].length - 1
//   }

//   gridPosition.x = adjustedPosition.x
//   gridPosition.y = adjustedPosition.z

//   gridPosition.x = Math.floor(gridPosition.x)
//   gridPosition.y = Math.floor(gridPosition.y)

//   gridPosition.x = Math.min(gridPosition.x, gridObject.grid.length - 1)
//   gridPosition.y = Math.min(
//     gridPosition.y,
//     gridObject.grid[gridPosition.x].length - 1
//   )

//   return gridPosition
// }


