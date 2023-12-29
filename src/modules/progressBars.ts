import { Entity, Transform, MeshRenderer, Material, TransformType, engine } from "@dcl/sdk/ecs";
import { ProgressBar } from "../definitions";
import { Color4, Vector3, Quaternion, Scalar } from "@dcl/sdk/math";
import { parentEntity, syncEntity } from "@dcl/sdk/network";


export function CreateProgressBar(parent: Entity, height?: number, yRotation?: number, movesUp?: boolean, speed?: number) {

  const background = engine.addEntity()
  Transform.create(background, {
    position: Vector3.create(0, height ? height : 1, 0),
    scale: Vector3.create(0.82, 0.15, 1),
    rotation: Quaternion.fromEulerDegrees(0, yRotation ? yRotation : 0, 0)
  })
  MeshRenderer.setPlane(background)

  syncEntity(background, [Transform.componentId])
  parentEntity(background, parent)

  const progressBar = engine.addEntity()
  Transform.create(progressBar, {
    position: Vector3.create(0, 0, -0.03),
    scale: Vector3.create(0.95, 0.8, 1)
  })
  MeshRenderer.setPlane(progressBar)

  Material.setBasicMaterial(progressBar, { diffuseColor: Color4.Green() })

  ProgressBar.create(progressBar, {
    parent: parent,
    color: Color4.Green(),
    movesUp: movesUp,
    ratio: movesUp ? 0 : 1,
    redWarning: movesUp ? 0.8 : 0.2,
    speed: speed ? speed : 1
  })

  syncEntity(progressBar, [Transform.componentId, Material.componentId])
  parentEntity(progressBar, background)




  // TODO: IDS FOR PROGRESS BARS


  return progressBar


}




export function ProgressBarUpdate(dt: number) {
  for (const [entity] of engine.getEntitiesWith(ProgressBar)) {
    const progressBar = ProgressBar.getMutable(entity);
    if (progressBar.active) {
      if (progressBar.movesUp) {
        progressBar.ratio += dt / 10 * progressBar.speed

        if (progressBar.ratio > progressBar.yellowWarning && progressBar.color == Color4.Green()) {
          changeBarColor(entity, Color4.Yellow())
        } else if (progressBar.ratio > progressBar.redWarning && progressBar.color != Color4.Red()) {
          changeBarColor(entity, Color4.Red())

          // DO SOMETHING?
          // smoke if parent = pot ??


        } else if (progressBar.ratio > progressBar.fullLength) {
          progressBar.ratio = 1
          progressBar.active = false

          // DO SOMETHING?
        }

      } else {
        progressBar.ratio -= dt / 10 * progressBar.speed
        if (progressBar.ratio < progressBar.yellowWarning && progressBar.color == Color4.Green()) {
          changeBarColor(entity, Color4.Yellow())
        } else if (progressBar.ratio < progressBar.redWarning && progressBar.color != Color4.Red()) {
          changeBarColor(entity, Color4.Red())

          // DO SOMETHING?
          // smoke if parent = pot ??


        } else if (progressBar.ratio <= 0) {
          progressBar.ratio = 0
          progressBar.active = false

          // DO SOMETHING?

        }
      }


      if (progressBar.ratio > progressBar.fullLength) {
        progressBar.active = false;

      }
      const transform = Transform.getMutable(entity);

      let width = Scalar.lerp(0, progressBar.fullLength, progressBar.ratio)
      transform.scale.x = width
      transform.position.x = -progressBar.fullLength / 2 + width / 2

      console.log(transform.scale.x)
    }

  }
}


export function changeBarColor(entity: Entity, color: Color4) {
  const progressBar = ProgressBar.getMutable(entity)
  progressBar.color = color

  const material = Material.getMutable(entity)
  Material.setBasicMaterial(entity, { diffuseColor: color })


  // CHANGE ACTUAL BAR MATERIAL

}

export function RemoveProgressBar(entity: Entity) {
  //TODO

  engine.removeEntityWithChildren(entity)
}