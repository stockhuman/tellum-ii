import { testAudio } from './audio'
import { db } from './database'
import { registerHardware, hwe, HWEvent } from './hardware'

const database = db
let location = { x: 0, y: 0 }

async function setup() {
  registerHardware()
  await testAudio()
}


function handleHWEvent(event: HWEvent) {
  switch (event.type) {
    
  }
}

hwe.on('event', handleHWEvent)
setup()
