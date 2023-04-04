import { readFile } from 'fs'
import { resolve } from 'path'
import { play, record, say, stop, testAudio } from './audio'
import AudioRecorder from './audiorecorder'
import { db } from './database'
import { registerHardware, hwe, HWEvent, cmd } from './hardware'

const database = db
const state = {
  location: { x: 0, y: 0 },
  isHooked: true,
  isHolding: false,
  heldKey: null as HWEvent['key'],
  holdRepeater: null,
  isEnteringCoordinate: false,
  coordinateString: '',
  hasCompletedIntro: false,
  entry: 0,
  recorder: null as AudioRecorder,
  currentID: null,
}

async function setup() {
  registerHardware()
  await testAudio(true)
  state.holdRepeater = setInterval(() => {
    // repeat for quick nav
    if (state.isHolding && state.heldKey !== '5' && state.heldKey !== '*' && state.heldKey !== '0') {
      nav(state.heldKey)
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
      state.heldKey = event.key
      state.isHolding = true
      if (event.key === '*') {
        startRecording()
      } else {
        nav(event.key)
      }
      break
    case 'released':
      state.isHolding = false
      state.heldKey = null
      if (event.key === '*') {
        stopRecording()
      }
      break
  }
}

async function nav(key: HWEvent['key']) {
  stop()
  if (state.isHooked) return // ignore random events

  // play the tone before recording starts
  if (key === '*') {
    console.log('pressed *')
    await play('ring')
    return
  }

  play(`ui/${key}`)
  // check for files at the current coordinate, LED on if true
  const files = database.check(state.location.x, state.location.y)
  if (files.length > 0) cmd('f')
  else cmd('d')

  if (state.isEnteringCoordinate) {
    if (state.coordinateString.length > 0 && key === '#' && state.coordinateString.split('#').length === 2) {
      // entered coordinates correctly (1234#1234#)
      let coords = state.coordinateString.split('#')
      await say(`Visiting coordinates ${coords[0] || 0} and ${coords[1] || 0}`)
      state.location = { x: Number(coords[0] || 0), y: Number(coords[1] || 0) }
      state.isEnteringCoordinate = false
      state.coordinateString = ''
      if (database.check(state.location.x, state.location.y).length > 0) cmd('f')
      else cmd('d')
      return
    }
    if (key === '#') {
      // will not have '#' appended to it yet
      say(`X set to ${state.coordinateString}, now enter the Y value and press pound to navigate`)
    }
    state.coordinateString += key
    return
  }

  switch (key) {
    case '1': // -1, 1
      state.location.x--
      state.location.y++
      break
    case '2': // 0, 1
      state.location.y++
      break
    case '3': // 1, 1
      state.location.x++
      state.location.y++
      break
    case '4': // -1, 0
      state.location.x--
      break
    case '5': // center selection
      break
    case '6': // 1, 0
      state.location.x++
      break
    case '7': // -1, -1
      state.location.x--
      state.location.y--
      break
    case '8': // 0, -1
      state.location.y--
      break
    case '9': // 1, -1
      state.location.x++
      state.location.y--
      break
  }

  console.log('heldkey',state.heldKey)
  if (state.isHolding && key === '5') {
    state.isEnteringCoordinate = true
    say(`Please enter the first number of the coordinate you wish to travel to, then press the pound key.`)
    return
  }

  if (state.isHolding && key === '0') {
    say('returning home')
    state.location = { x: 0, y: 0 }
    return
  }

  if (await tutorial()) {
    // normal directional navigation
    if (key !== '#' && key !== '5') {
      if (state.recorder) state.recorder.stop()
      console.log('nav:', state.location.x, state.location.y)
      play('ui/nav')
      say(`${state.location.x}, ${state.location.y}`)
    }

    // hear options again
    if (key === '5') {
      await say('') // idk?
      await say(
        `There are ${files.length > 0 ? files.length.toString() : 'no'} sound${
          files.length === 1 ? '' : 's'
        } here. Press and hold the star key record your own. A green light will shine. Release to save. Hold the five key to enter coordinates.`,
      )
      if (files.length > 0) {
        await say(
          'Or press the pound key to listen to each entry. You can skip entries by pressing the pound key again.',
        )
      }
    }

    if (files.length > 0 && key === '#') {
      play(files[state.entry % files.length])
      state.entry += 1
    } else {
      // reset otherwise
      state.entry = 0
    }
  }
}

async function startRecording() {
  state.currentID = Date.now().toString()
  console.log('recording', state.currentID)
  // await say('Sing your song, leave your message, after the tone.')

  cmd('r')
  state.recorder = record(state.currentID)
}

async function stopRecording () {
  console.log('stopped recording', state.currentID)
  // stop recorder
  state.recorder.stop()
  readFile(resolve(__dirname, `../audio/${state.currentID}.wav`), (err, data) => {
    if (err) console.log(err)
    console.log(data)
  })

  
  // database.add({
  //   file: state.currentID,
  //   ...state.location,
  //   time: new Date().toISOString(),
  // })
  await play('ui/mech')
  say('thanks')
  state.currentID = null
  cmd('s')
}

async function tutorial() {
  if (!state.hasCompletedIntro) {
    if (state.location.x === 0 && state.location.y === 0) {
      await play('ui/tutorial00')
      return false
    }

    if (state.location.x === -1 && state.location.y === -1) {
      await play('ui/tutorial-1-1')
      return false
    }

    if (state.location.x === -1 && state.location.y === -2) {
      await play('ui/tutorial-1-2')
      state.hasCompletedIntro = true
      return false
    }
  }
  // continue sound execution
  return true
}

function intro() {
  play('ui/bell')
  play('ui/welcome')
  state.isHooked = false
}

function reset() {
  state.location = { x: 0, y: 0 }
  state.hasCompletedIntro = false
  state.isHooked = true
  state.isEnteringCoordinate
  cmd('d')
  if (state.recorder) {
    state.recorder.stop()
    state.recorder = null
    state.currentID = null
    cmd('s')
  }
  stop()
}

hwe.on('event', handleHWEvent)
setup()
