import { registerKeypad, kbe } from './keypad'

async function setup() {
  registerKeypad()
}

kbe.on('keyPressed', console.log)

setup()
