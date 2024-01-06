import {
  engine,
  GltfContainer,
  Transform,
  Animator,
  PointerEvents,
  PointerEventType,
  InputAction,
  Entity,
  MeshCollider,
  MeshRenderer,
  AudioSource,
  ColliderLayer,
  pointerEventsSystem,
  Tween,
  EasingFunction
} from '@dcl/sdk/ecs'
import { Vector3, Quaternion } from '@dcl/sdk/math'
import { BeerGlass, BeerType, CuttingBoard, DynamicSyncId, getTapData, GrabableObjectComponent, IngredientType, SyncEntityIDs, TapBase, TapComponent } from '../definitions'
import { syncEntity, parentEntity } from '@dcl/sdk/network'
import { cutSushi } from './cuttingBoard'
import { getSyncId } from './helpers'




// BEER GLASS

export function instanceBeer(entity: Entity, id: SyncEntityIDs) {

  BeerGlass.create(entity)

  GrabableObjectComponent.create(entity, { type: IngredientType.BeerGlass })


  // PointerEvents.create(glassEntity, {
  //   pointerEvents: [
  //     {
  //       eventType: PointerEventType.PET_DOWN,
  //       eventInfo: {
  //         hoverText: 'Pick up',
  //         maxDistance: 5,
  //         button: InputAction.IA_PRIMARY
  //       }
  //     }
  //   ]
  // })

  syncEntity(
    entity,
    [Animator.componentId, AudioSource.componentId, Transform.componentId, BeerGlass.componentId, GrabableObjectComponent.componentId],
    id
  )

}


// INGREDIENT


export function createIngredient(ingredient: IngredientType, position: Vector3, fall?: boolean) {
  const entity = engine.addEntity()

  let model = ""

  switch (ingredient) {
    case IngredientType.Noodles:
      model = "assets/models/NoodlesRaw.glb"
      break
    case IngredientType.SushiRoll:
      model = "assets/models/SushiRoll.glb"
      break
    case IngredientType.CookedNoodles:
      model = "assets/models/PlateNoodles.glb"
      break
    case IngredientType.SlicedSushi:
      model = "assets/models/PlateSushi.glb"
      break
    case IngredientType.Trash:
      model = "assets/models/GarbageFood.glb"
      break
  }

  GltfContainer.create(entity, {
    src: model,
    visibleMeshesCollisionMask: ColliderLayer.CL_POINTER,
    invisibleMeshesCollisionMask: undefined
  })

  Transform.create(entity, { position })

  GrabableObjectComponent.create(entity, { type: ingredient })

  PointerEvents.create(entity, {
    pointerEvents: [
      {
        eventType: PointerEventType.PET_DOWN,
        eventInfo: {
          hoverText: 'Pick up',
          maxDistance: 5,
          button: InputAction.IA_PRIMARY
        }
      }
    ]
  })

  if (fall) {
    Tween.create(entity, {
      mode: Tween.Mode.Move({
        start: position,
        end: Vector3.add(position, Vector3.create(0, -0.7, 0)),
      }),
      duration: 500,
      easingFunction: EasingFunction.EF_LINEAR
    })
  }

  let id = getSyncId(entity)

  syncEntity(
    entity,
    [AudioSource.componentId, Transform.componentId, GrabableObjectComponent.componentId, Tween.componentId, GltfContainer.componentId, DynamicSyncId.componentId], id
  )

  return ingredient

}


// BEER TAP

export function createTap(tapBeerType: BeerType, dispenseEntity: Entity, id: SyncEntityIDs) {
  const tapEntity = engine.addEntity()
  const tapData = getTapData(tapBeerType)

  TapComponent.create(tapEntity, {
    beerType: tapBeerType
  })
  GltfContainer.create(tapEntity, {
    src: tapData.model
  })
  Transform.create(tapEntity, {
    //parent: dispenseEntity
  })
  parentEntity(tapEntity, dispenseEntity)
  Animator.create(tapEntity, {
    states: [
      {
        clip: 'Blank',
        playing: true,
        loop: false
      },
      {
        clip: 'Pour',
        loop: false
      }
    ]
  })

  PointerEvents.create(tapEntity, {
    pointerEvents: [
      {
        eventType: PointerEventType.PET_DOWN,
        eventInfo: {
          hoverText: 'Pour',
          maxDistance: 5,
          button: InputAction.IA_PRIMARY
        }
      }
    ]
  })


  syncEntity(tapEntity, [Animator.componentId, AudioSource.componentId], id)


  const tapColliderPosition = Vector3.add(tapData.position, Vector3.create(0, 0.05, 0))
  const colliderParentEntity = engine.addEntity()
  Transform.create(colliderParentEntity, {
    //parent: tapEntity,
    position: tapColliderPosition
  })
  TapBase.create(colliderParentEntity, {
    beerType: tapBeerType
  })
  syncEntity(colliderParentEntity, [], id + 100)
  parentEntity(colliderParentEntity, tapEntity)


  const colliderEntity = engine.addEntity()
  Transform.create(colliderEntity, {
    //parent: colliderParentEntity,
    scale: Vector3.scale(Vector3.One(), 0.33),
    rotation: Quaternion.fromEulerDegrees(90, 0, 0)
  })

  syncEntity(colliderEntity, [], id + 200)
  parentEntity(colliderEntity, colliderParentEntity)


  MeshCollider.setPlane(colliderEntity)
  // Debug to see the collider
  //MeshRenderer.setPlane(colliderEntity)
  PointerEvents.create(colliderEntity, {
    pointerEvents: [
      {
        eventType: PointerEventType.PET_DOWN,
        eventInfo: {
          hoverText: 'Place mug',
          button: InputAction.IA_PRIMARY
        }
      }
    ]
  })
}

// CUTTING BOARD

export function createCuttingBoard(position: Vector3, id: SyncEntityIDs) {


  const CutterParent = engine.addEntity()
  Transform.create(CutterParent, {
    position: position,
    rotation: Quaternion.fromEulerDegrees(0, 0, 0)
  })

  syncEntity(CutterParent, [], id + 100)

  const boardModel = engine.addEntity()

  CuttingBoard.create(CutterParent, {
    modelEntity: boardModel
  })

  GltfContainer.create(boardModel, {
    src: "assets/models/Cutter.gltf",
    visibleMeshesCollisionMask: ColliderLayer.CL_POINTER
  })

  Transform.create(boardModel, {
    position: Vector3.create(0, -0.1, 0),
    scale: Vector3.create(0.01, 0.01, 0.01),
    rotation: Quaternion.fromEulerDegrees(0, 180, 0)
  })



  Animator.create(boardModel, {
    states: [
      {
        clip: 'State0',
        playing: true,
        loop: false
      },
      {
        clip: 'State1',
        playing: false,
        loop: false
      },
      {
        clip: 'State2',
        playing: false,
        loop: false
      },
      {
        clip: 'State3',
        playing: false,
        loop: false
      },
      {
        clip: 'State4',
        playing: false,
        loop: false
      },
      {
        clip: 'State5',
        playing: false,
        loop: false
      },
    ]
  })


  pointerEventsSystem.onPointerDown(
    {
      entity: boardModel,
      opts: { button: InputAction.IA_PRIMARY, hoverText: 'Put', maxDistance: 5, },
    },
    function () {
      cutSushi(CutterParent, boardModel)
      console.log('clicked entity')
    }
  )



  syncEntity(boardModel, [Animator.componentId, AudioSource.componentId, CuttingBoard.componentId, PointerEvents.componentId], id)

  parentEntity(boardModel, CutterParent)





  // const colliderEntity = engine.addEntity()
  // Transform.create(colliderEntity, {
  //   parent: colliderParentEntity,
  //   scale: Vector3.scale(Vector3.One(), 0.33),
  //   rotation: Quaternion.fromEulerDegrees(90, 0, 0)
  // })

  // syncEntity(colliderEntity, [], id + 200)
  // parentEntity(colliderEntity, colliderParentEntity)


  // MeshCollider.setPlane(colliderEntity)
  // // Debug to see the collider
  // //MeshRenderer.setPlane(colliderEntity)
  // PointerEvents.create(colliderEntity, {
  //   pointerEvents: [
  //     {
  //       eventType: PointerEventType.PET_DOWN,
  //       eventInfo: {
  //         hoverText: 'Place mug',
  //         button: InputAction.IA_PRIMARY
  //       }
  //     }
  //   ]
  // })
}




