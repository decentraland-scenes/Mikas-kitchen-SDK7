import { Entity, Material, engine, Transform, TextShape, MeshRenderer, TextAlignMode } from "@dcl/sdk/ecs";
import { SpeechBubbleType } from "../definitions";
import { Color4, Vector3, Quaternion } from "@dcl/ecs-math";
import { syncEntity, parentEntity, getChildren } from '@dcl/sdk/network'
import { getSyncId } from "./helpers";

const bubble1Texture = Material.Texture.Common({
  src: 'assets/textures/bubble.png',
})

const bubble3Texture = Material.Texture.Common({
  src: 'assets/textures/bubble3.png',
})


export function createSpeechBubble(parent: Entity, text: string, height?: number, bubbleType?: SpeechBubbleType) {

  const bubbleParent = engine.addEntity()
  Transform.create(bubbleParent, {
    position: Vector3.create(-1, 0, 0),
    rotation: Quaternion.fromEulerDegrees(0, 180, 0)
  })

  const bubbleParentId = getSyncId(bubbleParent)


  syncEntity(bubbleParent, [], bubbleParentId)
  parentEntity(bubbleParent, parent)


  const background = engine.addEntity()
  Transform.create(background, {
    position: Vector3.create(-0.6, height ? height - 0.35 : 0.65, 0),
    scale: Vector3.create(1.4, 1.6, 1),
    rotation: Quaternion.fromEulerDegrees(0, 0, 0)
  })
  MeshRenderer.setPlane(background)


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

  const backgroundParentId = getSyncId(background)

  syncEntity(background, [Material.componentId, Transform.componentId], backgroundParentId)
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

  const textParentId = getSyncId(textEntity)


  syncEntity(textEntity, [TextShape.componentId, Transform.componentId], textParentId)
  parentEntity(textEntity, bubbleParent)



  // TODO: Handle IDS for multiplayer


  return bubbleParent
}


export function updateSpeechBubble(bubble: Entity, text: string, bubbleType?: SpeechBubbleType) {

  const children = Array.from(getChildren(bubble))
  let backgroundEntity: Entity | undefined = undefined
  let textEntity: Entity | undefined = undefined

  for (const ent of children) {
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




export function RemoveSpeechBubble(bubble: Entity) {

  // TODO
  engine.removeEntityWithChildren(bubble)
}
