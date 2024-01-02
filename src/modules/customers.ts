import { GltfContainer, Animator, Transform, engine, Entity, TextShape } from "@dcl/sdk/ecs"
import { Vector3, Scalar, Quaternion, Color4 } from '@dcl/sdk/math'
import { ProgressBar, CustomerData, IngredientType, SpeechBubbleType } from "../definitions";
import { CreateProgressBar, RemoveProgressBar } from "./progressBars";
import { RemoveSpeechBubble, createSpeechBubble } from "./speechBubble";
import { syncEntity, parentEntity } from '@dcl/sdk/network'
import * as utils from '@dcl-sdk/utils'

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

let playerScore: number = 0
let playerMisses: number = 0

let customerTimer: number = 2
let customerInterval: number = 10

const ACCELERATION_RATE: number = 0.99

export function CreateCustomer() {

  const customer = engine.addEntity()

  let position: Vector3 = Vector3.Zero()
  let takenSeats: number[] = []

  const customers = engine.getEntitiesWith(CustomerData)
  let customerCount = 0;
  for (const [customer] of customers) {
    customerCount++;
    takenSeats.push(CustomerData.get(customer).seatNumber)
  }

  let seatNumber: number = 0

  if (customerCount > 4) return


  if (playerScore >= 150) {
    if (!takenSeats.includes(1)) {
      position = position1
      seatNumber = 1
    } else if (!takenSeats.includes(2)) {
      position = position2
      seatNumber = 2
    } else if (!takenSeats.includes(3)) {
      position = position3
      seatNumber = 3
    } else if (!takenSeats.includes(4)) {
      position = position4
      seatNumber = 4
    } else return

  } else if (playerScore >= 50) {
    console.log("CUSTOMER COUNT: ", customerCount, "TAKEN SEATS: ", takenSeats)
    if (!takenSeats.includes(1)) {
      position = position1
      seatNumber = 1
    } else if (!takenSeats.includes(2)) {
      position = position2
      seatNumber = 2
    } else return
  } else {
    if (customerCount < 1) {
      position = position1
      seatNumber = 1
    } else return
  }


  for (const [cust] of customers) {
    const customerData = CustomerData.getMutable(cust)
    if (customerData.seatNumber == seatNumber) {
      seatNumber += 1
    }
  }
  if (seatNumber > 4) { return }



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

  syncEntity(customer, [GltfContainer.componentId, Transform.componentId, CustomerData.componentId, Animator.componentId])

  const randomTime = Scalar.randomRange(3, 6)

  const progressBar = CreateProgressBar(customer, 1.3, 180, false, 0.1)

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



  const speechBubble = createSpeechBubble(customer, messages[randomIndex], 2.3)

  CustomerData.create(customer, {
    dish: dish,
    message: messages[randomIndex],
    speechBubble: speechBubble,
    receivedDish: false,
    seatNumber: seatNumber,
    //plate: CustomerPlate
    timeBeforeLeaving: Scalar.randomRange(3, 4),
    timeBeforeEntering: randomTime,
    waitingTimer: randomTime,
    progressBar: progressBar
  })
}

export function CustomerSystem(dt: number) {

  // update progress bars
  for (const [entity] of engine.getEntitiesWith(CustomerData)) {

    const customerData = CustomerData.getMutable(entity)

    if (customerData.progressBar && ProgressBar.has(customerData.progressBar)) {

      const progressBar = ProgressBar.getMutable(customerData.progressBar)
      if (progressBar.speed > 0 && progressBar.ratio <= 0) {
        // Time's up for this order so we feed a wrong dish on purpose

        let wrongDish = customerData.dish + 1
        if (wrongDish == Object.keys(IngredientType).length) {
          wrongDish = 0
        }

        deliverOrder(wrongDish, entity)

        RemoveProgressBar(customerData.progressBar)

      }
    }

    if (customerData.receivedDish && customerData.waitingTimer > 0) {
      customerData.waitingTimer -= dt

      if (customerData.waitingTimer <= 0) {

        engine.removeEntityWithChildren(entity)

        // CreateCustomer()


      }


    }


  }
  // add new customers
  customerTimer -= dt
  if (customerTimer <= 0) {
    CreateCustomer()
    customerTimer = customerInterval
    customerInterval = customerInterval * ACCELERATION_RATE
    console.log("NEW CUSTOMER INTERVAL", customerInterval)
  }
}


export function deliverOrder(dishType: number, customer: Entity, dish?: Entity) {


  const customerData = CustomerData.getMutable(customer)

  if (customerData.progressBar) {
    RemoveProgressBar(customerData.progressBar)
  }


  if (customerData.speechBubble) {
    RemoveSpeechBubble(customerData.speechBubble)
  }



  if (customerData.dish == dishType) {
    // Correct dish
    playerScore += 10
    updateScore()
    const message = customerCorrectDishMessages[Math.floor(Scalar.randomRange(0, customerCorrectDishMessages.length))]
    customerData.message = message

    const speechBubble = createSpeechBubble(customer, message, 2.3, SpeechBubbleType.Good)
    customerData.speechBubble = speechBubble

  } else {
    // Wrong dish
    playerMisses += 1
    updateMisses()
    const message = customerWrongDishMessages[Math.floor(Scalar.randomRange(0, customerWrongDishMessages.length))]
    customerData.message = message

    const speechBubble = createSpeechBubble(customer, message, 2.3, SpeechBubbleType.Bad)
    customerData.speechBubble = speechBubble
  }


  customerData.receivedDish = true

  if (dish) {
    utils.timers.setTimeout(() => { engine.removeEntity(dish) }, 3000)

  }

}



export function updateScore() {

  const scoreEntity = engine.getEntityOrNullByName("Score")
  if (scoreEntity) {
    const scoreText = TextShape.getMutable(scoreEntity)
    scoreText.text = "Score: " + playerScore.toString()
  }

}

export function updateMisses() {
  const missesEntity = engine.getEntityOrNullByName("Misses")
  if (missesEntity) {
    const missesText = TextShape.getMutable(missesEntity)
    missesText.text = "Misses: " + playerMisses.toString()
  }
}