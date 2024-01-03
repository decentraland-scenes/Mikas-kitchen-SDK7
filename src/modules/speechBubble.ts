import { Entity, Material, engine, Transform, TextShape, MeshRenderer, TextAlignMode, VisibilityComponent } from "@dcl/sdk/ecs";
import { SpeechBubbleType, SyncEntityIDs } from "../definitions";
import { Color4, Vector3, Quaternion } from "@dcl/ecs-math";
import { syncEntity, parentEntity, getChildren } from '@dcl/sdk/network'
import { getSyncId } from "./helpers";

const bubble1Texture = Material.Texture.Common({
  src: 'assets/textures/bubble.png',
})

const bubble3Texture = Material.Texture.Common({
  src: 'assets/textures/bubble3.png',
})


export function createSpeechBubble(parent: Entity, seatNumber: number, text: string, height?: number, bubbleType?: SpeechBubbleType) {


  let bubbleParentId = SyncEntityIDs.BUBBLE1_A
  let backgroundId = SyncEntityIDs.BUBBLE1_B
  let textId = SyncEntityIDs.BUBBLE1_C

  switch (seatNumber) {
    case 1:
      bubbleParentId = SyncEntityIDs.BUBBLE1_A
      backgroundId = SyncEntityIDs.BUBBLE1_B
      textId = SyncEntityIDs.BUBBLE1_C
      break;
    case 2:
      bubbleParentId = SyncEntityIDs.BUBBLE2_A
      backgroundId = SyncEntityIDs.BUBBLE2_B
      textId = SyncEntityIDs.BUBBLE2_C
      break;
    case 3:
      bubbleParentId = SyncEntityIDs.BUBBLE3_A
      backgroundId = SyncEntityIDs.BUBBLE3_B
      textId = SyncEntityIDs.BUBBLE3_C
      break;
    case 4:
      bubbleParentId = SyncEntityIDs.BUBBLE4_A
      backgroundId = SyncEntityIDs.BUBBLE4_B
      textId = SyncEntityIDs.BUBBLE4_C
      break;
  }


  const bubbleParent = engine.addEntity()
  Transform.create(bubbleParent, {
    position: Vector3.create(-1, 0, 0),
    rotation: Quaternion.fromEulerDegrees(0, 180, 0)
  })


  syncEntity(bubbleParent, [], bubbleParentId)
  parentEntity(bubbleParent, parent)


  const background = engine.addEntity()
  Transform.create(background, {
    position: Vector3.create(-0.6, height ? height - 0.35 : 0.65, 0),
    scale: Vector3.create(1.4, 1.6, 1),
    rotation: Quaternion.fromEulerDegrees(0, 0, 0)
  })
  MeshRenderer.setPlane(background)

  VisibilityComponent.createOrReplace(background, { visible: false })


  let texture = bubble1Texture
  let color = Color4.Gray()

  switch (bubbleType) {
    case SpeechBubbleType.Good:
      texture = bubble3Texture
      color = Color4.Green()
      break
    case SpeechBubbleType.Bad:
      texture = bubble3Texture
      color = Color4.Red()
      break
  }

  Material.setBasicMaterial(background, {
    diffuseColor: color,
    texture: texture,

  })

  syncEntity(background, [Material.componentId, Transform.componentId, VisibilityComponent.componentId], backgroundId)
  parentEntity(background, bubbleParent)

  const textEntity = engine.addEntity()

  Transform.create(textEntity, {
    position: Vector3.create(-1, height ? height - 0.1 : 0.9, -0.03),
    scale: Vector3.create(0.85, 0.85, 0.85),
    rotation: Quaternion.fromEulerDegrees(0, 0, 0)
  })

  TextShape.create(textEntity, {
    text: text,
    width: 1.1,
    height: 1.1,
    textAlign: TextAlignMode.TAM_MIDDLE_LEFT,
    fontSize: 1,
  })

  //const textParentId = getSyncId(textEntity)

  VisibilityComponent.createOrReplace(textEntity, { visible: false })

  syncEntity(textEntity, [TextShape.componentId, Transform.componentId, VisibilityComponent.componentId], textId)
  parentEntity(textEntity, bubbleParent)



  // TODO: Handle IDS for multiplayer


  return bubbleParent
}


export function updateSpeechBubble(bubble: Entity, text: string, bubbleType?: SpeechBubbleType) {

  const children = Array.from(getChildren(bubble))
  let backgroundEntity: Entity | undefined = undefined
  let textEntity: Entity | undefined = undefined

  for (const ent of children) {
    VisibilityComponent.deleteFrom(ent)
    if (TextShape.has(ent)) {
      textEntity = ent
    }
    if (MeshRenderer.has(ent)) {
      backgroundEntity = ent
    }
  }

  if (!backgroundEntity || !textEntity) { return }


  let texture = bubble1Texture
  let color = Color4.Gray()

  switch (bubbleType) {
    case SpeechBubbleType.Good:
      texture = bubble3Texture
      color = Color4.Green()
      break
    case SpeechBubbleType.Bad:
      texture = bubble3Texture
      color = Color4.Red()
      break
  }

  Material.setBasicMaterial(backgroundEntity, {
    diffuseColor: color,
    texture: texture,

  })

  TextShape.getMutable(textEntity).text = text


}


export function HideSpeechBubble(bubble: Entity) {

  const children = Array.from(getChildren(bubble))

  for (const ent of children) {
    VisibilityComponent.createOrReplace(ent, { visible: false })
  }

}




export function RemoveSpeechBubble(bubble: Entity) {

  // TODO
  engine.removeEntityWithChildren(bubble)
}
