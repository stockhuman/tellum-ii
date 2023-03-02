import { testAudio } from './audio'
import { registerKeypad, kbe } from './keypad'

async function setup() {
  registerKeypad()
  testAudio()
}

kbe.on('keyPressed', console.log)

setup()
