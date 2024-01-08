import { Vector3, Color4 } from '@dcl/sdk/math'
import { engine, Schemas, } from '@dcl/sdk/ecs'
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
  BEER_DISPENSER = 19,
  GAME_SESSION = 20,
  SCORE_TEXT = 21,
  MISSES_TEXT = 22,
  POT_BUTTON1 = 23,
  POT_BUTTON2 = 24,
  DISPENSER_BUTTON1 = 25,
  DISPENSER_BUTTON2 = 26,
  RESET_BUTTON = 27,
  BUBBLE1_A = 28,
  BUBBLE1_B = 29,
  BUBBLE1_C = 30,
  BUBBLE2_A = 31,
  BUBBLE2_B = 32,
  BUBBLE2_C = 33,
  BUBBLE3_A = 34,
  BUBBLE3_B = 35,
  BUBBLE3_C = 36,
  BUBBLE4_A = 37,
  BUBBLE4_B = 38,
  BUBBLE4_C = 39,
  PBAR1_A = 40,
  PBAR1_B = 41,
  PBAR2_A = 42,
  PBAR2_B = 43,
  PBAR3_A = 44,
  PBAR3_B = 45,
  PBAR4_A = 46,
  PBAR4_B = 47,
  PBAR5_A = 48,
  PBAR5_B = 49,
  PBAR6_A = 50,
  PBAR6_B = 51,
  CUSTOMER1 = 52,
  CUSTOMER2 = 53,
  CUSTOMER3 = 54,
  CUSTOMER4 = 55,
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
  BeerGlass,
  YellowBeer,
  RedBeer,
  GreenBeer,
}

export enum SpeechBubbleType {
  Neutral,
  Good,
  Bad
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

// export const DynamicSyncId = engine.defineComponent('DynamicSyncId', {
//   id: Schemas.Number
// })

export const HighestID = engine.defineComponent('HighestID', {
  id: Schemas.Number
})


export const BeerGlass = engine.defineComponent('BeerGlass', {
  //beingFilled: Schemas.Boolean,
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
})


export const GrabableObjectComponent = engine.defineComponent('GrabableObjectComponent', {
  type: Schemas.EnumNumber<IngredientType>(IngredientType, IngredientType.Noodles),
  beingProcessed: Schemas.Boolean,
  processed: Schemas.Boolean,
}, {
  type: IngredientType.Noodles,
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



export const ProgressBar = engine.defineComponent('ProgressBar', {
  visible: Schemas.Boolean,
  active: Schemas.Boolean,
  ratio: Schemas.Number,
  yellowWarning: Schemas.Number,
  redWarning: Schemas.Number,
  fullLength: Schemas.Number,
  movesUp: Schemas.Boolean,
  color: Schemas.Color4,
  speed: Schemas.Number,
  parent: Schemas.Entity
}, {
  visible: true,
  active: true,
  ratio: 0,
  yellowWarning: 0.5,
  redWarning: 0.75,
  fullLength: 1,
  movesUp: true,
  color: Color4.Green(),
  speed: 1,
  //parent: Schemas.Entity
})



export const CustomerData = engine.defineComponent('CustomerData', {
  active: Schemas.Boolean,
  dish: Schemas.EnumNumber<IngredientType>(IngredientType, IngredientType.Noodles),
  message: Schemas.String,
  speechBubble: Schemas.Entity,
  receivedDish: Schemas.Boolean, // TODO: true to force the 1st initialization??
  //plate: CustomerPlate
  seatNumber: Schemas.Number,
  timeBeforeLeaving: Schemas.Number,
  timeBeforeEntering: Schemas.Number,
  waitingTimer: Schemas.Number,
  progressBar: Schemas.Entity
}, {
  active: false,
  receivedDish: false,
  timeBeforeLeaving: 30,
  timeBeforeEntering: 10,
  waitingTimer: 30,
})

export const GameData = engine.defineComponent('GameData', {
  active: Schemas.Boolean,
  playerScore: Schemas.Number,
  playerMisses: Schemas.Number,
  customerTimer: Schemas.Number,
  customerInterval: Schemas.Number,
}, {
  active: true,
  playerScore: 0,
  playerMisses: 0,
  customerTimer: 2,
  customerInterval: 10,
})
