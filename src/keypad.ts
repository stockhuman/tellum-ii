import EventEmitter from 'events'
import { Gpio } from 'onoff'

import { ePin } from './util/gpio'

const eventEmitter = new EventEmitter()

const selectA = new Gpio(ePin(1), 'out')
const selectB = new Gpio(ePin(2), 'out')
const selectC = new Gpio(ePin(3), 'out')
const columns = [selectA, selectB, selectC]

const readA = new Gpio(ePin(7), 'in')
const readB = new Gpio(ePin(6), 'in')
const readC = new Gpio(ePin(5), 'in')
const readD = new Gpio(ePin(0), 'in')
const rows = [readA, readB, readC, readD]

const keypadPins: Gpio[] = [...rows, ...columns]
const keyStates = {
  '0': false,
  '1': false,
  '2': false,
  '3': false,
  '4': false,
  '5': false,
  '6': false,
  '7': false,
  '9': false,
  '*': false,
  '#': false,
}
let scanInterval = null
let selectPin = 0

function registerKeypad() {
  console.info(`GPIO is ${Gpio.accessible? '' : 'not'} available`)
  readA.watch(determineKeyPressed)
  readB.watch(determineKeyPressed)
  readC.watch(determineKeyPressed)
  readD.watch(determineKeyPressed)
  selectA.writeSync(1) // scanning initial state
  setTimeout(() => {
    // sync scanning to logic
    scanInterval = setInterval(scan, 4)
  }, 4)
  process.on('SIGINT', unregisterKeypad)
}

function scan() {
  let nextPin = (selectPin + 1) % columns.length
  columns[selectPin].writeSync(0)
  columns[nextPin].writeSync(1)
  selectPin = nextPin
}

function determineKeyPressed() {
  let pinA = Boolean(readA.readSync())
  let pinB = Boolean(readB.readSync())
  let pinC = Boolean(readC.readSync())
  let pinD = Boolean(readD.readSync())
  console.log(pinA, pinB, pinC, pinD)
  switch (selectPin) {
    /** @TODO determine actual pin-to-letter combos */
    case 0:
      if (pinA && pinA !== keyStates['0']) eventEmitter.emit('keyPressed', { key: '0' })
      if (pinA && pinA === keyStates['0']) eventEmitter.emit('keyReleased', { key: '0' })
      if (pinB && pinB !== keyStates['1']) eventEmitter.emit('keyPressed', { key: '1' })
      if (pinB && pinB === keyStates['1']) eventEmitter.emit('keyReleased', { key: '1' })
      if (pinC && pinC !== keyStates['2']) eventEmitter.emit('keyPressed', { key: '2' })
      if (pinC && pinC === keyStates['2']) eventEmitter.emit('keyReleased', { key: '2' })
      if (pinD && pinD !== keyStates['3']) eventEmitter.emit('keyPressed', { key: '3' })
      if (pinD && pinD === keyStates['3']) eventEmitter.emit('keyReleased', { key: '3' })
      break
    case 1:
      break
    case 2:
      break

    default:
      break
  }
}

function unregisterKeypad() {
  for (let i = 0; i < keypadPins.length; i++) {
    keypadPins[i].unexport()
  }
}

export { registerKeypad, unregisterKeypad }
