import { testAudio } from './audio'
import { registerHardware, hwe } from './hardware'

async function setup() {
  registerHardware()
  testAudio()
}

hwe.on('event', console.log)

setup()
