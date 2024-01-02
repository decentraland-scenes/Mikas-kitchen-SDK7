import { Animator, engine, InputAction, inputSystem, PointerEventType, Transform } from '@dcl/sdk/ecs'
import { Scalar } from '@dcl/sdk/math'
import { BeerGlass, BeerType, getTapData, GrabableObjectComponent, IngredientType, TapBase, TapComponent } from '../definitions'
import { getPlayerPosition, playSound } from './helpers'
import { getParent } from '@dcl/sdk/network'

function getBeerBehindTap(beerType: BeerType) {
  for (const [glassEntity] of engine.getEntitiesWith(BeerGlass)) {

    const glassParent = getParent(glassEntity)
    if (glassParent && TapBase.getOrNull(glassParent)?.beerType === beerType) {
      return glassEntity
    }
  }
}

export function tapPumpSystem(dt: number) {
  for (const [entity, tapReadonly] of engine.getEntitiesWith(TapComponent)) {
    // While is pouring
    if (tapReadonly.pouring) {
      // At start the pouring, play the sound an animation
      if (Scalar.withinEpsilon(tapReadonly.pouringTime, 0)) {
        Animator.playSingleAnimation(entity, `Pour`)
        playSound('sounds/beerPump.mp3', false, getPlayerPosition())
        const glassEntity = getBeerBehindTap(tapReadonly.beerType)
        if (glassEntity) Animator.playSingleAnimation(glassEntity, `Pour${getTapData(tapReadonly.beerType).name}`)
      }

      const tap = TapComponent.getMutable(entity)
      tap.pouringTime += dt

      if (tap.pouringTime >= 2.5) {
        tap.pouring = false
        tap.pouringTime = 0

        const glassEntity = getBeerBehindTap(tap.beerType)
        if (glassEntity) {
          const glass = BeerGlass.getMutable(glassEntity)
          glass.beerType = tap.beerType
          //glass.beingFilled = false
          glass.filled = true
          const grabbable = GrabableObjectComponent.getMutable(glassEntity)
          grabbable.beingProcessed = false
        }
      }

      // Listen the action
    } else if (inputSystem.isTriggered(InputAction.IA_PRIMARY, PointerEventType.PET_DOWN, entity)) {
      const glassEntity = getBeerBehindTap(tapReadonly.beerType)
      if (!glassEntity) {
        // TODO: notify that there is no glass
        return
      }

      const glass = BeerGlass.getMutable(glassEntity)
      if (glass.filled) {
        // TODO: notify that the glass is filled
        return
      }

      const tap = TapComponent.getMutable(entity)
      tap.pouring = true
      tap.pouringTime = 0

      //glass.beingFilled = true
      glass.beerType = tap.beerType
      const grabbable = GrabableObjectComponent.getMutable(glassEntity)
      grabbable.beingProcessed = true
      switch (tap.beerType) {
        case BeerType.YELLOW:
          grabbable.type = IngredientType.YellowBeer
          break
        case BeerType.RED:
          grabbable.type = IngredientType.RedBeer
          break
        case BeerType.GREEN:
          grabbable.type = IngredientType.GreenBeer
          break

      }

      grabbable.type
    }
  }
}
