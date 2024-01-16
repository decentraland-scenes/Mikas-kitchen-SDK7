import { Transform, engine, executeTask, Entity, Animator, AudioSource } from '@dcl/sdk/ecs'
import { Vector3 } from '@dcl/sdk/math'
import { getUserData } from '~system/UserIdentity'
import { DynamicSyncId } from '../definitions'

export function getPlayerPosition() {
  return Transform.getOrNull(engine.PlayerEntity)?.position || Vector3.create()
}

export let currentPlayerId: string

void executeTask(async () => {
  const user = await getUserData({})
  if (!user.data) return
  currentPlayerId = user.data?.userId
})

export function* getEntitiesWithParent(parent: Entity) {
  for (const [entity, transform] of engine.getEntitiesWith(Transform)) {
    if (transform.parent === parent) {
      yield [entity, transform]
    }
  }
}

export function getEntityParent(entity: Entity) {
  return Transform.getOrNull(entity)?.parent || engine.RootEntity
}




export function playSound(audio: string, loop: boolean = false, position?: Vector3) {
  const entity = engine.addEntity()
  AudioSource.create(entity, {
    audioClipUrl: audio,
    loop,
    playing: true
  })

  Transform.create(entity, {
    position
  })

  return entity
}

