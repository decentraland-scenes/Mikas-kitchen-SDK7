import { Vector3 } from '@dcl/sdk/math'
import { engine, Schemas } from '@dcl/sdk/ecs'
/**
 * Types
 */

export enum SyncEntityIDs {
  TAP_RED = 1,
  TAP_GREEN = 2,
  TAP_YELLOW = 3,
  CUTTER1 = 4,
  CUTTER2 = 5,
  POT1 = 6,
  POT2 = 7,
  DISPENSER_ROLLS = 8,
  DISPENSER_NOODLES = 9,
  GLASS1 = 10,
  GLASS2 = 11,
  GLASS3 = 12,
  GLASS4 = 13,
  GLASS5 = 14,
  GLASS6 = 15,
  GLASS7 = 16,
  GLASS8 = 17,
  GLASS9 = 18,
  BEER_DISPENSER = 19
  // TABLES = 19
}


export enum BeerType {
  NONE,
  RED,
  YELLOW,
  GREEN
}

export type TapDataType = {
  model: string
  position: Vector3
  name: string
}

export enum TileType {
  Floor,
  Shelf,
  Expender,
  Trash,
  Pot,
  Cutter,
  Plate,
}

export enum SoupState {
  Empty,
  Raw,
  Cooked,
  Burned,
}

export enum IngredientType {
  Noodles,
  SushiRoll,
  CookedNoodles,
  SlicedSushi,
  Trash,
  BeerGlass
}




export const TAP_DATA: Record<string, TapDataType> = {
  [BeerType.RED]: {
    name: 'Red',
    model: 'assets/models/redTap.glb',
    position: Vector3.create(0.368, 0, 0.31)
  },
  [BeerType.YELLOW]: {
    name: 'Yellow',
    model: 'assets/models/yellowTap.glb',
    position: Vector3.create(0, 0, 0.31)
  },
  [BeerType.GREEN]: {
    name: 'Green',
    model: 'assets/models/greenTap.glb',
    position: Vector3.create(-0.368, 0, 0.31)
  }
}

export function getTapData(tapBeerType: BeerType) {
  return (TAP_DATA as any)[tapBeerType] as TapDataType
}

/**
 * Component Definitions
 */

export const BeerGlass = engine.defineComponent('BeerGlass', {
  beingFilled: Schemas.Boolean,
  filled: Schemas.Boolean,
  beerType: Schemas.EnumNumber<BeerType>(BeerType, BeerType.NONE),
  drinking: Schemas.Boolean
})
export const PickedUp = engine.defineComponent('PickedUp', {
  //child: Schemas.Entity,
  avatarId: Schemas.String
})

export const TapComponent = engine.defineComponent('TapComponent', {
  pouringTime: Schemas.Number,
  pouring: Schemas.Boolean,
  beerType: Schemas.EnumNumber<BeerType>(BeerType, BeerType.NONE)
})

export const TapBase = engine.defineComponent('TapBase', {
  beerType: Schemas.EnumNumber<BeerType>(BeerType, BeerType.NONE)
})


// export const GridPosition = engine.defineComponent('GridPosition', {
//   object: Schemas.Entity,
//   type: Schemas.EnumNumber<TileType>(TileType, TileType.Floor)

// })

export const PotData = engine.defineComponent('Pot', {
  state: Schemas.EnumNumber<SoupState>(SoupState, SoupState.Raw),
  hasIngredient: Schemas.Boolean,
  progressBar: Schemas.Entity,
  attachedEntity: Schemas.Entity || undefined
}, {
  state: SoupState.Empty,
  hasIngredient: false,
  attachedEntity: undefined,
  //progressBar: 0,
})


export const GrabableObjectComponent = engine.defineComponent('GrabableObjectComponent', {
  type: Schemas.EnumNumber<IngredientType>(IngredientType, IngredientType.Noodles),
  beingProcessed: Schemas.Boolean,
  processed: Schemas.Boolean,
  // grabbed: Schemas.Boolean,
  // falling: Schemas.Boolean,
  // origin: Schemas.Number,
  // target: Schemas.Number,
  // fraction: Schemas.Number,
  //progressBar: Schemas.Entity,
  // attachedEntity: Schemas.Entity
}, {
  type: IngredientType.Noodles,
  // grabbed: false,
  // falling: false,
  // origin: 0.4,
  // target: 0,
  // fraction: 0
})

export const Cooking = engine.defineComponent('Cooking', {
  active: Schemas.Boolean,
  time: Schemas.Number,
  progressBar: Schemas.Entity,
}, {
  active: true,
  time: 0,
})


export const CuttingBoard = engine.defineComponent('CuttingBoard', {
  hasRoll: Schemas.Boolean,
  cutting: Schemas.Boolean,
  rollChild: Schemas.Entity || undefined,
  cuts: Schemas.Number,
  cutTime: Schemas.Number,
  totalCutTime: Schemas.Number,
  modelEntity: Schemas.Entity
}, {
  hasRoll: false,
  cuts: 0,
  rollChild: undefined,
  cutting: false,
  cutTime: 0.7,
  totalCutTime: 0.7
})

