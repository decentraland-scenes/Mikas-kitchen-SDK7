import {
  ColliderLayer, engine, Animator,
  AudioSource, VisibilityComponent, Material,
  VideoPlayer, pointerEventsSystem,
  AvatarAttach, GltfContainer, PointerEvents, Tween, PointerEventType, TextShape, Transform, CameraModeArea, CameraType
} from '@dcl/sdk/ecs'
import { Vector3, Quaternion } from '@dcl/sdk/math'
import { BeerType, IngredientType, SyncEntityIDs, SpeechBubbleType, GameData, HighestID } from './definitions'
import { pickingGlassSystem } from './modules/pickAndDrop'
import { createCuttingBoard, createIngredient, createTap, instanceBeer } from './modules/factory'
import { tapPumpSystem } from './modules/tap'
import { setupUi } from './ui'
import { initAssetPacks } from '@dcl/asset-packs/dist/scene-entrypoint'
import { instancePot, startCooking, cookSystem } from './modules/pot'
import { getTriggerEvents, getActionEvents } from '@dcl/asset-packs/dist/events'
import { TriggerType } from '@dcl/asset-packs'
import { syncEntity } from '@dcl/sdk/network'
import { ProgressBarUpdate } from './modules/progressBars'
import { createSpeechBubble } from './modules/speechBubble'
import { CustomerSystem, CreateCustomer, restartGame } from './modules/customers'

// You can remove this if you don't use any asset packs
initAssetPacks(engine, pointerEventsSystem, {
  Animator,
  AudioSource,
  AvatarAttach,
  Transform,
  VisibilityComponent,
  GltfContainer,
  Material,
  VideoPlayer
})


export function main() {

  HighestID.create(engine.RootEntity, { id: 1001 })
  syncEntity(engine.RootEntity, [HighestID.componentId], 1000)



  const gameEntity = engine.addEntity()
  GameData.create(gameEntity, {})
  syncEntity(gameEntity, [GameData.componentId], SyncEntityIDs.GAME_SESSION)



  const easterEgg = engine.addEntity()
  Transform.create(easterEgg, {
    position: Vector3.create(19, 2, 4),
    rotation: Quaternion.fromEulerDegrees(0, 90, 0)
  })
  TextShape.create(easterEgg, {
    text: "You don't want to know what's\nbehind the kitchen",
    fontSize: 3,
  })


  //Ingredient expenders
  const noodles_expender = engine.getEntityOrNullByName("ExpenderNoodles")
  const roll_expender = engine.getEntityOrNullByName("ExpenderRolls")
  const noodles_button = engine.getEntityOrNullByName("Noodle Button")
  const roll_button = engine.getEntityOrNullByName("Roll Button")

  // TODO: HANDLE IDS FOR MULTIPLAYER MODE

  if (noodles_expender && roll_expender && noodles_button && roll_button) {
    const noodles_button_events = getTriggerEvents(noodles_button)
    noodles_button_events.on(TriggerType.ON_CLICK, () => {
      console.log("BUTTON WAS PRESSED!!")
      const startPosition = Vector3.add(Transform.get(noodles_expender).position, Vector3.create(0, 0.7, 0))
      createIngredient(IngredientType.Noodles, startPosition, true)

    })

    const roll_button_events = getTriggerEvents(roll_button)
    roll_button_events.on(TriggerType.ON_CLICK, () => {
      console.log("BUTTON WAS PRESSED!!")
      const startPosition = Vector3.add(Transform.get(roll_expender).position, Vector3.create(0, 0.7, 0))
      createIngredient(IngredientType.SushiRoll, startPosition, true)

    })

    syncEntity(noodles_button, [Animator.componentId, AudioSource.componentId], SyncEntityIDs.DISPENSER_BUTTON1)
    syncEntity(roll_button, [Animator.componentId, AudioSource.componentId], SyncEntityIDs.DISPENSER_BUTTON2)


  }


  // Pots
  const pot1 = engine.getEntityOrNullByName("Pot1")
  const pot2 = engine.getEntityOrNullByName("Pot2")
  const pot1_button = engine.getEntityOrNullByName("Pot1 Button")
  const pot2_button = engine.getEntityOrNullByName("Pot2 Button")


  if (pot1 && pot2 && pot1_button && pot2_button) {
    instancePot(pot1, SyncEntityIDs.POT1, SyncEntityIDs.PBAR5_A, SyncEntityIDs.PBAR5_B)
    instancePot(pot2, SyncEntityIDs.POT2, SyncEntityIDs.PBAR6_A, SyncEntityIDs.PBAR6_B)


    const pot1_button_events = getTriggerEvents(pot1_button)
    pot1_button_events.on(TriggerType.ON_CLICK, () => {
      console.log("BUTTON WAS PRESSED!!")
      startCooking(pot1)
    })

    const pot2_button_events = getTriggerEvents(pot2_button)
    pot2_button_events.on(TriggerType.ON_CLICK, () => {
      console.log("BUTTON WAS PRESSED!!")
      startCooking(pot2)

      //createSpeechBubble(pot1, "I'm a pot MUAHAHA", 1, SpeechBubbleType.Bad)
    })

    syncEntity(pot1_button, [Animator.componentId, AudioSource.componentId], SyncEntityIDs.POT_BUTTON1)
    syncEntity(pot2_button, [Animator.componentId, AudioSource.componentId], SyncEntityIDs.POT_BUTTON2)

  }

  // restart button
  const restart = engine.getEntityOrNullByName("Restart_Button")
  if (restart) {
    const restart_event = getTriggerEvents(restart)
    restart_event.on(TriggerType.ON_CLICK, () => {
      restartGame()
    })

    syncEntity(restart, [Animator.componentId, AudioSource.componentId], SyncEntityIDs.RESET_BUTTON)

  }

  // customers
  CreateCustomer(1)
  CreateCustomer(2)
  CreateCustomer(3)
  CreateCustomer(4)




  // Beer dispenser
  const dispenserEntity = engine.addEntity()
  GltfContainer.create(dispenserEntity, {
    src: 'assets/models/beerDispenser.glb'
  })
  Transform.create(dispenserEntity, {
    position: Vector3.create(19.5, 1, 8.5),
    rotation: Quaternion.fromEulerDegrees(0, 270, 0)
  })
  syncEntity(dispenserEntity, [], SyncEntityIDs.BEER_DISPENSER)

  // Create taps
  createTap(BeerType.RED, dispenserEntity, SyncEntityIDs.TAP_RED)
  createTap(BeerType.GREEN, dispenserEntity, SyncEntityIDs.TAP_YELLOW)
  createTap(BeerType.YELLOW, dispenserEntity, SyncEntityIDs.TAP_GREEN)


  //create cutting boards
  createCuttingBoard(Vector3.create(17.5, 1.1, 14.5), SyncEntityIDs.CUTTER1)
  createCuttingBoard(Vector3.create(15.5, 1.1, 14.5), SyncEntityIDs.CUTTER2)


  // Beer glasses

  const beer1 = engine.getEntityOrNullByName("Beer1")
  const beer2 = engine.getEntityOrNullByName("Beer2")
  const beer3 = engine.getEntityOrNullByName("Beer3")
  const beer4 = engine.getEntityOrNullByName("Beer4")
  const beer5 = engine.getEntityOrNullByName("Beer5")
  const beer6 = engine.getEntityOrNullByName("Beer6")
  const beer7 = engine.getEntityOrNullByName("Beer7")
  const beer8 = engine.getEntityOrNullByName("Beer8")
  const beer9 = engine.getEntityOrNullByName("Beer9")

  if (beer1 && beer2 && beer3 && beer4 && beer5 && beer6 && beer7 && beer8 && beer9) {

    instanceBeer(beer1, SyncEntityIDs.GLASS1)
    instanceBeer(beer2, SyncEntityIDs.GLASS2)
    instanceBeer(beer3, SyncEntityIDs.GLASS3)
    instanceBeer(beer4, SyncEntityIDs.GLASS4)
    instanceBeer(beer5, SyncEntityIDs.GLASS5)
    instanceBeer(beer6, SyncEntityIDs.GLASS6)
    instanceBeer(beer7, SyncEntityIDs.GLASS7)
    instanceBeer(beer8, SyncEntityIDs.GLASS8)
    instanceBeer(beer9, SyncEntityIDs.GLASS9)

  }


  // FOR TESTING
  // createIngredient(IngredientType.Noodles, Vector3.create(4.4, 0.8, 1.5))
  // createIngredient(IngredientType.SushiRoll, Vector3.create(6.4, 0.8, 1.5))
  // createIngredient(IngredientType.SlicedSushi, Vector3.create(8.4, 0.8, 1.5))
  // createIngredient(IngredientType.CookedNoodles, Vector3.create(10.4, 0.8, 1.5))

  // camera modifiera area
  const cameraMod = engine.addEntity()

  Transform.create(cameraMod, { position: Vector3.create(17, 2, 12) })

  CameraModeArea.create(cameraMod, {
    area: Vector3.create(6, 2, 10),
    mode: CameraType.CT_FIRST_PERSON,
  })


  const score = engine.getEntityOrNullByName("Score")
  const misses = engine.getEntityOrNullByName("Misses")
  if (score && misses) {
    syncEntity(score, [TextShape.componentId], SyncEntityIDs.SCORE_TEXT)
    syncEntity(misses, [TextShape.componentId], SyncEntityIDs.MISSES_TEXT)
  }



  engine.addSystem(pickingGlassSystem)
  engine.addSystem(tapPumpSystem)
  engine.addSystem(cookSystem)
  engine.addSystem(ProgressBarUpdate)
  engine.addSystem(CustomerSystem)

  // UI with GitHub link
  setupUi()

}
