import { GltfContainer, Animator, Transform, engine, Entity, TextShape, VisibilityComponent } from "@dcl/sdk/ecs"
import { Vector3, Scalar, Quaternion, Color4 } from '@dcl/sdk/math'
import { ProgressBar, CustomerData, IngredientType, SpeechBubbleType, BeerGlass, BeerType, GameData, SyncEntityIDs, GrabableObjectComponent } from "../definitions";
import { CreateProgressBar, HideProgressBar, ResetProgressBar } from "./progressBars";
import { HideSpeechBubble, RemoveSpeechBubble, createSpeechBubble, updateSpeechBubble } from "./speechBubble";
import { syncEntity, parentEntity } from '@dcl/sdk/network'
import * as utils from '@dcl-sdk/utils'
import { getPlayerPosition, playSound } from "./helpers";

const customerRawNoodleMessages = [
  "Me like some \nnoodles! Me like'em RAW!",
  'RAW noodles please, \nand hurry!',
  'Noodles! A nice \ndry brick of RAW ones!',
  'Noodles! \nNO cooking for me',
  'HARD RAW NOODLES'
]

const customerRawSushiMessages = [
  'They say you got \nthe best rolls, \ngimme! NO slicing!',
  'One roll please. \nIn ONE piece!',
  'A full sushi roll \nI can swallow in one gulp!',
  'SUSHI. NO CUTTING.'
]

const customerCookedNoodleMessages = [
  'I want cooked \nnoodles, NOW!',
  'I... need... my... \nhot... noodles...',
  'Ramen Noodles, they \nbetter be here soon.',
  "Decentraland's best \nramen huh? I'll try some",
  'A bowl of noodles, \nplease'
]

const customerSlicedSushiMessages = [
  'sliced sushi! \nonegai shimaaasu!',
  'Sushi. Tic Toc.',
  'Sushi dammit! \nWhat rya waiting for?',
  'Been exploring \nDecentraland all day, \nsushi please'
]

const customerTrashMessages = [
  'Noodles! Gimme \nthe stinky ones!',
  'Noodles, the burrrrrrrnt\n the better!',
  'Well-cooked noodles. \nBurnt, as you people say.',
  "They say you sell\n garbage for food,\n I'd like some",
  "Garbage, don't care\n what kind"
]

const customerEmptyBeerMessages = [
  'An empty beer glass. \nSo it looks like I was \nwaiting long',
  'Just a glass, nothing\n in it. \nFeeling existential.',
  'Empty glass. All I\n can afford.',
]

const customerYellowBeerMessages = [
  'I want a cold regular\n beer!',
  'I heard you do craft\n beer, gimme a yellow!',
  'Beer! A nice cold normal\n one!',
]

const customerRedBeerMessages = [
  'I want a RED beer!',
  'Red beer. Im a \nbit of a hipster!',
  'Beer red like the \nblood of my enemies! \nlol',
]


const customerGreenBeerMessages = [
  'I like weird stuff, \ngreen beer!',
  'Green Beer. Dont care \nabout the taste, want \na cool pic for insagram',
  'Beer! A nice cold \ngreen one!',
]


const customerLookingMessage = [
  'Im just here to watch',
  'I dont want anything. \nJust here to make you \nfeel uncomfortable.',
  'Making a documentary, \nkeep working as if \nIm not here',
]



const customerCorrectDishMessages = [
  'Excellent!',
  'Nicely done!',
  '(　＾∇＾)',
  'It was about time...',
  'Nice job!',
  'Just what I needed!',
  'Yummy!',
  'YES!!!',
  '( ˘ ³˘)',
  "It's fine"
]

const customerWrongDishMessages = [
  'Customer service \nSUCKS here!',
  'Do you even understand \nmy language?',
  'What a waste of time!',
  'NO! NO! NO!',
  "Guess who's a \nramen shop critic?",
  "I'll never come \nback here",
  "I'll talk SO bad \nabout this place",
  'щ(ºДºщ)',
  '@#&*#$!',
  '୧༼ಠ益ಠ༽'
]

const position1 = Vector3.create(13.5, 0.75, 10.5)
const position2 = Vector3.create(13.5, 0.75, 11.5)
const position3 = Vector3.create(13.5, 0.75, 12.5)
const position4 = Vector3.create(13.5, 0.75, 13.5)


const ACCELERATION_RATE: number = 0.99

export function CreateCustomer(seatNumber: number) {

  const customer = engine.addEntity()

  let position: Vector3 = Vector3.Zero()
  let customerSyncId: SyncEntityIDs = SyncEntityIDs.CUSTOMER1

  let progressBarIdA: SyncEntityIDs = SyncEntityIDs.PBAR1_A
  let progressBarIdB: SyncEntityIDs = SyncEntityIDs.PBAR1_B

  // TODO: dialog IDS

  switch (seatNumber) {
    case 1:
      position = position1;
      customerSyncId = SyncEntityIDs.CUSTOMER1
      progressBarIdA = SyncEntityIDs.PBAR1_A
      progressBarIdB = SyncEntityIDs.PBAR1_B
      break;
    case 2:
      position = position2;
      customerSyncId = SyncEntityIDs.CUSTOMER2
      progressBarIdA = SyncEntityIDs.PBAR2_A
      progressBarIdB = SyncEntityIDs.PBAR2_B
      break;
    case 3:
      position = position3;
      customerSyncId = SyncEntityIDs.CUSTOMER3
      progressBarIdA = SyncEntityIDs.PBAR3_A
      progressBarIdB = SyncEntityIDs.PBAR3_B
      break;
    case 4:
      position = position4;
      customerSyncId = SyncEntityIDs.CUSTOMER4
      progressBarIdA = SyncEntityIDs.PBAR4_A
      progressBarIdB = SyncEntityIDs.PBAR4_B
      break;
  }



  Transform.create(customer, {
    position: position,
    scale: Vector3.create(0.75, 0.75, 0.75),
    rotation: Quaternion.fromEulerDegrees(0, 90, 0)
  })

  // TODO: Add Shape randomization
  GltfContainer.create(customer, {
    src: "assets/models/walkers/BlockDog.glb",
  })
  Animator.create(customer)
  Animator.playSingleAnimation(customer, "Sitting", false)

  syncEntity(customer, [GltfContainer.componentId, Transform.componentId, CustomerData.componentId, Animator.componentId, VisibilityComponent.componentId], customerSyncId)

  const randomTime = Scalar.randomRange(2, 4)

  const progressBar = CreateProgressBar(customer, 1.3, 180, false, true, 0.1, progressBarIdA, progressBarIdB)


  const speechBubble = createSpeechBubble(customer, seatNumber, "Placeholder", 2.3)

  CustomerData.create(customer, {
    message: "placeHolder",
    speechBubble: speechBubble,
    receivedDish: false,
    seatNumber: seatNumber,
    //plate: CustomerPlate
    timeBeforeLeaving: Scalar.randomRange(3, 5),
    //timeBeforeEntering: randomTime,
    waitingTimer: randomTime,
    progressBar: progressBar
  })

  VisibilityComponent.createOrReplace(customer, { visible: false })

}

export function summonCustomer() {
  let takenSeats: number[] = []

  const [gameEntities] = engine.getEntitiesWith(GameData)
  const gameEntity = gameEntities[0]
  if (!gameEntity || !GameData.has(gameEntity)) {
    console.log("NO GAME ENTITY")
    return
  }
  const gameData = GameData.getMutable(gameEntity)


  let customerCount = 0;
  for (const [customer] of engine.getEntitiesWith(CustomerData)) {
    if (CustomerData.get(customer).active && CustomerData.get(customer).receivedDish == false) {
      customerCount++;
      takenSeats.push(CustomerData.get(customer).seatNumber)
    }
  }

  let seatNumber: number = 0

  if (customerCount > 4) return


  if (gameData.playerScore >= 150) {
    if (!takenSeats.includes(1)) {
      seatNumber = 1
    } else if (!takenSeats.includes(2)) {
      seatNumber = 2
    } else if (!takenSeats.includes(3)) {
      seatNumber = 3
    } else if (!takenSeats.includes(4)) {
      seatNumber = 4
    } else {
      console.log("FULLY STAFFED TABLES, customer count:", customerCount)
      return
    }

  } else if (gameData.playerScore >= 50) {
    console.log("CUSTOMER COUNT: ", customerCount, "TAKEN SEATS: ", takenSeats)
    if (!takenSeats.includes(1)) {
      seatNumber = 1
    } else if (!takenSeats.includes(2)) {
      seatNumber = 2
    } else {
      console.log("FULLY STAFFED TABLES, customer count:", customerCount)
      return
    }
  } else {
    if (customerCount < 1) {
      seatNumber = 1
    } else {
      console.log("FULLY STAFFED TABLES, customer count:", customerCount)
      return
    }
  }

  console.log("SUMMONING NEW CUSTOMER, SEAT NUMBER: ", seatNumber, "TAKEN SEATS ", takenSeats)

  for (const [customer] of engine.getEntitiesWith(CustomerData)) {
    console.log("ITERATING OVER CUSTOMERS")
    if (CustomerData.get(customer).seatNumber == seatNumber) {
      resetCustomer(customer)
    }
  }
}


export function hideCustomer(customer: Entity) {

  VisibilityComponent.createOrReplace(customer, { visible: false })

  const customerData = CustomerData.getMutable(customer)

  console.log("HIDING CUSTOMER: ", customerData.seatNumber)


  customerData.active = false
  customerData.receivedDish = false

  if (customerData.progressBar) {
    HideProgressBar(customerData.progressBar)
  }

  HideSpeechBubble(customerData.speechBubble)

}


export function resetCustomer(customer: Entity) {

  const customerData = CustomerData.getMutable(customer)

  customerData.active = true
  customerData.waitingTimer = 5
  customerData.timeBeforeLeaving = Scalar.randomRange(3, 5)
  //customerData.timeBeforeEntering = 10
  customerData.receivedDish = false

  VisibilityComponent.deleteFrom(customer)
  //Animator.playSingleAnimation(customer, "Sitting", false)

  ResetProgressBar(customerData.progressBar)

  const dish = Math.floor(Scalar.randomRange(0, 9))

  console.log("DISH SELECTED: ", dish)

  let messages: string[]
  switch (dish) {
    case 0:
      messages = customerRawNoodleMessages
      break
    case 1:
      messages = customerRawSushiMessages
      break
    case 2:
      messages = customerCookedNoodleMessages
      break
    case 3:
      messages = customerSlicedSushiMessages
      break
    case 4:
      messages = customerTrashMessages
      break
    case 5:
      messages = customerEmptyBeerMessages
      break
    case 6:
      messages = customerYellowBeerMessages
      break
    case 7:
      messages = customerRedBeerMessages
      break
    case 8:
      messages = customerGreenBeerMessages
      break
    default:
      messages = customerLookingMessage
      break
  }

  let randomIndex = Math.floor(Scalar.randomRange(0, messages.length))

  updateSpeechBubble(customerData.speechBubble, messages[randomIndex], SpeechBubbleType.Neutral)


  console.log("NEW TEXT: ", messages[randomIndex])

  customerData.dish = dish
  customerData.message = messages[randomIndex]

}



export function CustomerSystem(dt: number) {

  // update progress bars
  for (const [entity] of engine.getEntitiesWith(CustomerData)) {

    const customerData = CustomerData.getMutable(entity)

    if (customerData.active && customerData.progressBar && ProgressBar.has(customerData.progressBar)) {

      const progressBar = ProgressBar.getMutable(customerData.progressBar)
      if (progressBar.speed > 0 && progressBar.ratio <= 0) {
        // Time's up for this order so we feed a wrong dish on purpose

        let wrongDish = customerData.dish + 1
        if (wrongDish == Object.keys(IngredientType).length) {
          wrongDish = 0
        }

        deliverOrder(wrongDish, entity)

        HideProgressBar(customerData.progressBar)

      }
    }

    if (customerData.receivedDish && customerData.waitingTimer > 0) {
      customerData.waitingTimer -= dt

      if (customerData.waitingTimer <= 0) {

        hideCustomer(entity)

        //engine.removeEntityWithChildren(entity)

      }


    }


  }

  // add new customers
  for (const [entity] of engine.getEntitiesWith(GameData)) {

    const gameData = GameData.getMutable(entity)

    gameData.customerTimer -= dt
    if (gameData.customerTimer <= 0) {
      summonCustomer()
      gameData.customerTimer = gameData.customerInterval
      gameData.customerInterval = gameData.customerInterval * ACCELERATION_RATE
      console.log("NEW CUSTOMER INTERVAL", gameData.customerInterval)
    }
  }
}


export function deliverOrder(dishType: number, customer: Entity, dish?: Entity) {


  const customerData = CustomerData.getMutable(customer)

  if (customerData.receivedDish) return

  if (customerData.progressBar) {
    HideProgressBar(customerData.progressBar)
  }


  // if (customerData.speechBubble) {
  //   RemoveSpeechBubble(customerData.speechBubble)
  // }


  const [gameEntities] = engine.getEntitiesWith(GameData)
  const gameEntity = gameEntities[0]
  if (!gameEntity || !GameData.has(gameEntity)) return
  const gameData = GameData.getMutable(gameEntity)


  if (customerData.dish == dishType) {
    // Correct dish
    gameData.playerScore += 10
    updateScore()
    const message = customerCorrectDishMessages[Math.floor(Scalar.randomRange(0, customerCorrectDishMessages.length))]
    customerData.message = message

    updateSpeechBubble(customerData.speechBubble, message, SpeechBubbleType.Good)

    //playSound("sounds/error.mp3", false, getPlayerPosition())


  } else {
    // Wrong dish
    gameData.playerMisses += 1
    updateMisses()
    const message = customerWrongDishMessages[Math.floor(Scalar.randomRange(0, customerWrongDishMessages.length))]
    customerData.message = message

    updateSpeechBubble(customerData.speechBubble, message, SpeechBubbleType.Bad)

    playSound("sounds/error.mp3", false, getPlayerPosition())

    if (gameData.playerMisses <= 3) {

      utils.timers.setTimeout(() => {
        restartGame()

      }, 1000)


    }

    // const speechBubble = createSpeechBubble(customer, message, 2.3, SpeechBubbleType.Bad)
    // customerData.speechBubble = speechBubble
  }


  customerData.receivedDish = true

  if (dish) {
    utils.timers.setTimeout(() => {

      if (BeerGlass.has(dish)) {

        BeerGlass.getMutable(dish).filled = false
        BeerGlass.getMutable(dish).beerType = BeerType.NONE
        Animator.playSingleAnimation(dish, "Blank")
        playSound("sounds/swallow.mp3", false, getPlayerPosition())
        GrabableObjectComponent.getMutable(dish).type = IngredientType.BeerGlass
      } else {
        engine.removeEntity(dish)
      }


    }, 3000)

  }

}



export function updateScore() {

  const [gameEntities] = engine.getEntitiesWith(GameData)
  const gameEntity = gameEntities[0]
  if (!gameEntity || !GameData.has(gameEntity)) return
  const gameData = GameData.getMutable(gameEntity)


  const scoreEntity = engine.getEntityOrNullByName("Score")
  if (scoreEntity) {
    const scoreText = TextShape.getMutable(scoreEntity)
    scoreText.text = "Score: " + gameData.playerScore.toString()
  }

}

export function updateMisses() {

  const [gameEntities] = engine.getEntitiesWith(GameData)
  const gameEntity = gameEntities[0]
  if (!gameEntity || !GameData.has(gameEntity)) return
  const gameData = GameData.getMutable(gameEntity)


  const missesEntity = engine.getEntityOrNullByName("Misses")
  if (missesEntity) {
    const missesText = TextShape.getMutable(missesEntity)
    missesText.text = "Misses: " + gameData.playerMisses.toString()
  }
}


export function restartGame() {

  const [gameEntities] = engine.getEntitiesWith(GameData)
  const gameEntity = gameEntities[0]
  if (!gameEntity || !GameData.has(gameEntity)) return
  const gameData = GameData.getMutable(gameEntity)


  gameData.playerScore = 0
  gameData.playerMisses = 0
  gameData.customerTimer = 2
  gameData.customerInterval = 10

  const customers = engine.getEntitiesWith(CustomerData)
  for (const [customer] of customers) {
    hideCustomer(customer)
  }

  playSound("sounds/error.mp3", false, getPlayerPosition())

  updateScore()
  updateMisses()
}