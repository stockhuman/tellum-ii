import { play, record, say, stop, testAudio } from './audio'
import { db } from './database'
import { registerHardware, hwe, HWEvent } from './hardware'

const database = db
let location = { x: 0, y: 0 }
let isHooked = true
let isHolding = false
let heldKey = null
let holdRepeater = null
let hasCompletedIntro = false
let entry = 0
let recorder = null
let currentID = null

async function setup() {
  registerHardware()
  await testAudio(true)
  holdRepeater = setInterval(() => {
    if (isHolding) {
      nav(heldKey)
    }
  }, 200)
}

function handleHWEvent(event: HWEvent) {
  switch (event.type) {
    case 'hook':
      reset()
      break
    case 'unhook':
      intro()
      break
    case 'pressed':
      nav(event.key)
      break
    case 'held':
      heldKey = event.key
      isHolding = true
      break
    case 'released':
      isHolding = false
      heldKey = null
      break
  }
}

async function nav(key: HWEvent['key']) {
  stop()
  if (isHooked) return // ignore random events
  switch (key) {
    case '1': // -1, 1
      location.x--
      location.y++
      break
    case '2': // 0, 1
      location.y++
      break
    case '3': // 1, 1
      location.x++
      location.y++
      break
    case '4': // -1, 0
      location.x--
      break
    case '5': // center selection
      break
    case '6': // 1, 0
      location.x++
      break
    case '7': // -1, -1
      location.x--
      location.y--
      break
    case '8': // 0, -1
      location.y--
      break
    case '9': // 1, -1
      location.x++
      location.y--
      break
  }
  if (key !== '*' && key !== '#' && key !== '5') {
    if (recorder) recorder.stop()
    console.log('nav:', location.x, location.y)
    play('ui/up')
    say(`${location.x}, ${location.y}`)
  }

  if (key === '5') {
    const files = database.check(location.x, location.y)
    await say('') // idk?
    await say(
      `There are ${files.length > 0 ? files.length.toString() : 'no'} sound${
        files.length === 1 ? '' : 's'
      } here. Press the star key record your own.`,
    )
    if (files.length > 0) {
      await say(
        'Or press the pound key to listen to each entry. You can skip entries by pressing the pound key again.',
      )
    }
  }

  if (key === '*') {
    if (recorder) {
      // stop recorder
      recorder.stop()
      recorder = null
      database.add({
        file: currentID,
        ...location,
        time: new Date().toISOString(),
      })
      await play('ui/mech')
      say('thanks')
      currentID = null
    } else {
      await say('Sing your song, leave your message, after the tone.')
      await play('sinetest')
      currentID = Date.now().toString()
      recorder = record(currentID)
    }
  }

  if (key === '#') {
    const files = database.check(location.x, location.y)
    play(files[entry % files.length])
    entry += 1
  } else {
    // reset otherwise
    entry = 0
  }
}

function intro() {
  play('ui/bell')
  say('Welcome')
  isHooked = false
  hasCompletedIntro = true
}

function reset() {
  location = { x: 0, y: 0 }
  hasCompletedIntro = false
  isHooked = true
  stop()
}

hwe.on('event', handleHWEvent)
setup()
