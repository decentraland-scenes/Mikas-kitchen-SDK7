import {
  engine,
  inputSystem,
  InputAction,
  PointerEventType,
  Entity,
  Transform,
  AvatarAttach,
  AvatarAnchorPointType,
  Animator
} from '@dcl/sdk/ecs'
import { Vector3, Quaternion } from '@dcl/sdk/math'
import { BeerGlass, CuttingBoard, PotData, SoupState, GrabableObjectComponent, IngredientType, PickedUp, TapBase, CustomerData } from '../definitions'
import { playSound } from './factory'
import { currentPlayerId, getPlayerPosition } from './helpers'
import { syncEntity, parentEntity, getParent, removeParent, getChildren } from '@dcl/sdk/network'
import { ruinFood } from './cuttingBoard'
import { RemoveProgressBar } from './progressBars'
import { deliverOrder } from './customers'

export function pickingGlassSystem() {
  // DROP
  // If there is some PickedUp, so the behvior is to listen when this
  //  can be dropped
  for (const [entity, pickedUp] of engine.getEntitiesWith(PickedUp)) {
    const tryToDropCommand = inputSystem.getInputCommand(InputAction.IA_PRIMARY, PointerEventType.PET_DOWN)
    if (tryToDropCommand) {
      const pickedUpChild = Array.from(getChildren(entity))[0]
      if (pickedUp.avatarId !== currentPlayerId || !pickedUpChild) continue

      let drop = false
      const hitPosition = tryToDropCommand.hit?.position || getPlayerPosition()
      const hitEntity = tryToDropCommand.hit?.entityId as Entity
      const hitParentEntity = getParent(hitEntity)


      // If there is a tap base (the collider)
      if (hitParentEntity && TapBase.getOrNull(hitParentEntity)) {
        Transform.getMutable(pickedUpChild).rotation = Quaternion.Zero()
        Transform.getMutable(pickedUpChild).position = Vector3.Zero()
        console.log("DROPPED ON TAP")
        //removeParent(pickedUpChild)
        parentEntity(pickedUpChild, hitParentEntity)
        drop = true
      } else if (hitParentEntity && CuttingBoard.has(hitParentEntity)) {
        //If cutting board
        console.log("DROPPED ON CUTTING BOARD")
        const board = CuttingBoard.getMutable(hitParentEntity)
        if (!board || !board.hasRoll || !board.modelEntity) {
          //removeParent(pickedUpChild)
          parentEntity(pickedUpChild, hitParentEntity)
          drop = true
          Transform.getMutable(pickedUpChild).rotation = Quaternion.Zero()
          Transform.getMutable(pickedUpChild).position = Vector3.Zero()

          board.hasRoll = true
          board.rollChild = pickedUpChild
          board.cutting = false
          board.cuts = 0
          Animator.stopAllAnimations(hitEntity, true)

        }

      } else if (hitEntity && PotData.has(hitEntity)) {
        //If pot
        console.log("DROPPED ON POT")
        const pot = PotData.getMutable(hitEntity)
        if (pot && !pot.hasIngredient) {
          //removeParent(pickedUpChild)
          parentEntity(pickedUpChild, hitEntity)
          pot.hasIngredient = true
          pot.attachedEntity = pickedUpChild
          pot.state = SoupState.Raw
          drop = true
          const grabbable = GrabableObjectComponent.get(pickedUpChild)

          if (grabbable.type !== IngredientType.Noodles) {
            ruinFood(pickedUpChild)
          }
        }

      } else {
        // Table or  customer

        // Only it's allowed to hold the beer in surface parallel to floor

        const diff = Vector3.subtract(Vector3.Up(), tryToDropCommand.hit?.normalHit || Vector3.Zero())
        console.log("DROPPED ON TABLE ", Vector3.length(diff), tryToDropCommand.hit?.normalHit)
        if (Vector3.length(diff) < 0.05) {

          removeParent(pickedUpChild)
          Transform.createOrReplace(pickedUpChild, {
            position: hitPosition,
            parent: undefined
          })
          drop = true

          checkNearCustomer(pickedUpChild)
        }
      }



      // TODO: These line crashes the renderer
      // AvatarAttach.deleteFrom(entity)
      // engine.removeEntity(entity)
      if (drop) {
        PickedUp.deleteFrom(entity)

        playSound('sounds/putDown.mp3', false, hitPosition)
      }
    }

    // DRINK BEER
    // if (BeerGlass.has(pickedUp.child)) {
    //   const glass = BeerGlass.get(pickedUp.child)

    //   const tryToDrinkCommand = inputSystem.getInputCommand(InputAction.IA_SECONDARY, PointerEventType.PET_DOWN)
    //   if (glass.filled && tryToDrinkCommand) {
    //     BeerGlass.getMutable(pickedUp.child).filled = false
    //     Animator.playSingleAnimation(pickedUp.child, 'Blank')
    //     playSound('sounds/swallow.mp3', false, getPlayerPosition())
    //   }
    //   return
    // }
    return
  }

  // PICK UP
  // Only happens when there isn't any PickedUp component
  for (const [entity, grabbable] of engine.getEntitiesWith(GrabableObjectComponent, Transform)) {

    if (inputSystem.isTriggered(InputAction.IA_PRIMARY, PointerEventType.PET_DOWN, entity)) {


      if (grabbable.beingProcessed) { return }
      if (grabbable.type === IngredientType.BeerGlass) {
        const glass = BeerGlass.get(entity)
        if (glass.beingFilled) { return }
      }

      pickUpItem(entity)



    }
  }
}

export function pickUpItem(entity: Entity) {
  const oldParent = getParent(entity)
  const parentToGrabbed = engine.addEntity()
  PickedUp.create(parentToGrabbed, {
    avatarId: currentPlayerId
  })

  AvatarAttach.create(parentToGrabbed, {
    anchorPointId: AvatarAnchorPointType.AAPT_RIGHT_HAND
  })
  Transform.createOrReplace(entity, {
    position: Vector3.create(0, 0.225, 0),
    rotation: Quaternion.fromEulerDegrees(180, -90, -60),

  })

  syncEntity(parentToGrabbed, [AvatarAttach.componentId, Transform.componentId, PickedUp.componentId, GrabableObjectComponent.componentId])

  parentEntity(entity, parentToGrabbed)

  playSound('sounds/pickUp.mp3', false, getPlayerPosition())

  if (oldParent && PotData.has(oldParent)) {
    const pot = PotData.getMutable(oldParent)
    if (pot && pot.attachedEntity === entity) {
      pot.hasIngredient = false
      //pot.attachedEntity = undefined
      pot.state = SoupState.Empty

      RemoveProgressBar(pot.progressBar)
    }
  }

  if (oldParent && CuttingBoard.has(oldParent)) {
    const board = CuttingBoard.getMutable(oldParent)
    if (board && board.rollChild === entity) {
      board.hasRoll = false
      //board.rollChild = undefined
      board.cutting = false
      board.cuts = 0
    }
  }

}


export function checkNearCustomer(entity: Entity) {

  const itemTransform = Transform.get(entity)
  let closestCustomer = null
  let closestDistance = 1.5

  for (const [entity, customer, customerTransform] of engine.getEntitiesWith(CustomerData, Transform)) {
    const diff = Vector3.length(Vector3.subtract(itemTransform.position, customerTransform.position))
    if (diff < closestDistance) {
      closestCustomer = entity
      closestDistance = diff
    }
  }

  if (closestCustomer) {

    const itemData = GrabableObjectComponent.get(entity)


    deliverOrder(itemData.type, closestCustomer)
  }
}

