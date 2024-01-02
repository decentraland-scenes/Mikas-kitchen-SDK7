import { Animator, Entity, GltfContainer, InputAction, PointerEvents, pointerEventsSystem } from "@dcl/ecs";
import { CuttingBoard, GrabableObjectComponent, IngredientType } from "../definitions";
import * as utils from '@dcl-sdk/utils'

export function cutSushi(entity: Entity, modelEntity: Entity) {

  let boardData = CuttingBoard.getMutable(entity)

  if (!boardData.hasRoll || boardData.cutting) return

  let ingredient = boardData.rollChild

  let ingredientData = GrabableObjectComponent.getMutable(ingredient)

  if (ingredientData.type != IngredientType.SushiRoll) {
    ruinFood(ingredient)
  }

  boardData.cutting = true
  boardData.cuts += 1


  switch (boardData.cuts) {
    case 1:
      Animator.playSingleAnimation(modelEntity, "State1", false)
      break;
    case 2:
      Animator.playSingleAnimation(modelEntity, "State2", false)
      break;
    case 3:
      Animator.playSingleAnimation(modelEntity, "State3", false)
      break;
    case 4:
      Animator.playSingleAnimation(modelEntity, "State4", false)
      break;
    case 5:
      Animator.playSingleAnimation(modelEntity, "State5", false)
      if (ingredientData.type != IngredientType.SushiRoll) return

      utils.timers.setTimeout(() => {
        ingredientData.type = IngredientType.SlicedSushi
        GltfContainer.getMutable(ingredient).src = "assets/models/PlateSushi.glb"
      }, 300)

      break;
    case 6:
      Animator.playSingleAnimation(modelEntity, "State5", false)
      ruinFood(ingredient)
      break;
    default:
      break;
  }


  utils.timers.setTimeout(() => {
    boardData.cutting = false
  }, 500)

}

export function switchToCutMode(entity: Entity) {

  const pointerEvent = PointerEvents.getMutable(entity).pointerEvents[0]
  if (pointerEvent && pointerEvent.eventInfo) {
    pointerEvent.eventInfo.hoverText = "Cut"
    // pointerEvent.eventInfo.button = InputAction.IA_POINTER
  }
}

export function switchToEmpty(entity: Entity) {

  const pointerEvent = PointerEvents.getMutable(entity).pointerEvents[0]
  if (pointerEvent && pointerEvent.eventInfo) {
    pointerEvent.eventInfo.hoverText = "Put"
    pointerEvent.eventInfo.button = InputAction.IA_PRIMARY
  }
  Animator.stopAllAnimations(entity, true)

}


export function ruinFood(entity: Entity) {

  console.log("ruin food")

  let objectData = GrabableObjectComponent.getMutable(entity)

  objectData.type = IngredientType.Trash

  GltfContainer.getMutable(entity).src = "assets/models/GarbageFood.glb"

}