import { registerKeypad, kbe, available } from './keypad'

async function setup() {
  if (available) registerKeypad()
}

kbe.on('keyPressed', console.log)

setup()
