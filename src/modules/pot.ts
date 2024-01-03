import { engine, Animator, Entity, GltfContainer, PointerEvents, InputAction, PointerEventType } from "@dcl/ecs";
import { PotData, SoupState, Cooking, SyncEntityIDs, IngredientType, GrabableObjectComponent } from '../definitions'
import { pickUpItem } from "./pickAndDrop";
import { syncEntity, parentEntity } from '@dcl/sdk/network'
import { CreateProgressBar, HideProgressBar, ResetProgressBar } from "./progressBars";


const COOKED_AFTER: number = 5
const BURNT_AFTER: number = 10




export function instancePot(pot: Entity, id: number, pbid1: number, pbid2: number) {

  syncEntity(
    pot,
    [Cooking.componentId, PotData.componentId],
    id
  )

  const progressBar = CreateProgressBar(pot, 1, 270, true, true, 1, pbid1, pbid2)


  PotData.create(pot, {
    progressBar: progressBar,
  })

  PointerEvents.create(pot, {
    pointerEvents: [
      {
        eventType: PointerEventType.PET_DOWN,
        eventInfo: {
          hoverText: 'Add',
          maxDistance: 5,
          button: InputAction.IA_PRIMARY
        }
      }
    ]
  })




}




export function pickFood(pot: Entity) {

  const potData = PotData.getMutable(pot)
  if (potData && potData.hasIngredient && potData.attachedEntity !== undefined) {

    console.log("PICKING UP FROM POT")
    pickUpItem(potData.attachedEntity)
    potData.hasIngredient = false
    //potData.attachedEntity = undefined
    potData.state = SoupState.Raw

    if (Cooking.has(pot)) {
      Cooking.deleteFrom(pot)
    }

    HideProgressBar(potData.progressBar)

  }

}

export function startCooking(pot: Entity) {

  if (Cooking.has(pot) && Cooking.get(pot).active) return



  Cooking.createOrReplace(pot)

  PotData.getMutable(pot)

  ResetProgressBar(PotData.getMutable(pot).progressBar)

}


export function cookSystem(dt: number) {

  for (const [entity, _cooking, _potData] of engine.getEntitiesWith(Cooking, PotData)) {
    if (_cooking.active && _potData.hasIngredient) {

      const cooking = Cooking.getMutable(entity)



      cooking.time += dt

      if (cooking.time > COOKED_AFTER && _potData.hasIngredient && _potData.state === SoupState.Raw) {

        console.log("COOKED!")

        const potData = PotData.getMutable(entity)
        potData.state = SoupState.Cooked
        const food = potData.attachedEntity
        GltfContainer.getMutable(food).src = "assets/models/PlateNoodles.glb"
        GrabableObjectComponent.getMutable(food).type = IngredientType.CookedNoodles

      } else if (cooking.time > BURNT_AFTER && _potData.state === SoupState.Cooked) {

        console.log("BURNING!!!")

        GltfContainer.getMutable(entity).src = "assets/models/CookingPotDirty.glb"
        const potData = PotData.getMutable(entity)
        potData.state = SoupState.Burned
        const food = potData.attachedEntity
        GltfContainer.getMutable(food).src = "assets/models/GarbageFood.glb"
        GrabableObjectComponent.getMutable(food).type = IngredientType.Trash


      }

    } else if (_cooking.active && !_potData.hasIngredient) {
      Cooking.deleteFrom(entity)
      HideProgressBar(_potData.progressBar)
    }
  }
}