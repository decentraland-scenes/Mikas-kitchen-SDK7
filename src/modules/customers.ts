import { GltfContainer, Animator, Transform, engine, Entity } from "@dcl/sdk/ecs"
import { Vector3, Scalar, Quaternion, Color4 } from '@dcl/sdk/math'
import { ProgressBar, CustomerData, IngredientType, SpeechBubbleType } from "../definitions";
import { CreateProgressBar, RemoveProgressBar } from "./progressBars";
import { RemoveSpeechBubble, createSpeechBubble } from "./speechBubble";
import { syncEntity, parentEntity } from '@dcl/sdk/network'

const customerRawNoodleMessages = [
  "Me like some noodles! Me like'em RAW!",
  'RAW noodles please, and hurry!',
  'Noodles! A nice dry brick of RAW ones!',
  'Noodles! NO cooking for me',
  'HARD RAW NOODLES'
]

const customerRawSushiMessages = [
  'They say you got the best rolls, gimme! NO slicing!',
  'One roll please. In ONE piece!',
  'A full sushi roll I can swallow in one gulp!',
  'SUSHI. NO CUTTING.'
]

const customerCookedNoodleMessages = [
  'I want cooked noodles, NOW!',
  'I... need... my... hot... noodles...',
  'Ramen Noodles, they better be here soon.',
  "Decentraland's best ramen huh? I'll try some",
  'A bowl of noodles, please'
]

const customerSlicedSushiMessages = [
  'sliced sushi! onegai shimaaasu!',
  'Sushi. Tic Toc.',
  'Sushi dammit! What rya waiting for?',
  'Been exploring decentraland all day, sushi please'
]

const customerTrashMessages = [
  'Noodles! Gimme the stinky ones!',
  'Noodles, the burrrrrrrnt the better!',
  'Well-cooked noodles. Burnt, as you people say.',
  "They say you sell garbage for food, I'd like some",
  "Garbage, don't care what kind"
]

const customerEmptyBeerMessages = [
  'An empty beer glass. So it looks like I was waiting long',
  'Just a glass, nothing in it. Feeling existential.',
  'Empty glass. All I can afford.',
]

const customerYellowBeerMessages = [
  'I want a cold regular beer!',
  'I heard you do craft beer, gimme a yellow!',
  'Beer! A nice cold normal one!',
]

const customerRedBeerMessages = [
  'I want a RED beer!',
  'Red beer. Im a bit of a hipster!',
  'Beer red like the blood of my enemies! lol',
]


const customerGreenBeerMessages = [
  'I like weird stuff, green beer!',
  'Green Beer. Dont care about the taste, want a cool pic for insagram',
  'Beer! A nice cold green one!',
]


const customerLookingMessage = [
  'Im just here to watch',
  'I dont want anything. Just here to make you feel uncomfortable.',
  'Making a documentary, keep working as if Im not here',
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
  'Customer service SUCKS here!',
  'Do you even understand my language?',
  'What a waste of time!',
  'NO! NO! NO!',
  "Guess who's a ramen shop critic?",
  "I'll never come back here",
  "I'll talk SO bad about this place",
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

export function CreateCustomer() {

  const customer = engine.addEntity()

  let position: Vector3 = Vector3.Zero()

  const customers = engine.getEntitiesWith(CustomerData)
  let customerCount = 0;
  for (const num of customers) { customerCount++; }

  let seatNumber: number = 0

  if (customerCount > 4) return


  if (playerScore >= 350) {

    if (customerCount < 1) {
      position = position1
      seatNumber = 1
    } else if (customerCount < 2) {
      position = position2
      seatNumber = 2
    } else if (customerCount < 3) {
      position = position3
      seatNumber = 3
    } else if (customerCount < 4) {
      position = position4
      seatNumber = 4
    } else return
  } else if (playerScore >= 100) {
    if (customerCount < 1) {
      position = position1
      seatNumber = 1
    } else if (customerCount < 2) {
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

  const dish = Math.floor(Scalar.randomRange(0, Object.keys(IngredientType).length))

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

        CreateCustomer()


      }


    }


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
    const message = customerCorrectDishMessages[Math.floor(Scalar.randomRange(0, customerCorrectDishMessages.length))]
    customerData.message = message

    const speechBubble = createSpeechBubble(customer, message, 2.3, SpeechBubbleType.Good)
    customerData.speechBubble = speechBubble

  } else {
    // Wrong dish
    playerMisses += 1
    const message = customerWrongDishMessages[Math.floor(Scalar.randomRange(0, customerWrongDishMessages.length))]
    customerData.message = message

    const speechBubble = createSpeechBubble(customer, message, 2.3, SpeechBubbleType.Bad)
    customerData.speechBubble = speechBubble
  }


  customerData.receivedDish = true

  if (dish) {
    engine.removeEntity(dish)
  }

}
