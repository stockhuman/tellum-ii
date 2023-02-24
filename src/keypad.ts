import EventEmitter from 'events'
import { Gpio } from 'onoff'

import { ePin } from './util/gpio'

export const available = Gpio.accessible
export const kbe = new EventEmitter()

const selectA = new Gpio(ePin(3), 'out')
const selectB = new Gpio(ePin(4), 'out')
const selectC = new Gpio(ePin(5), 'out')
const columns = [selectA, selectB, selectC]

const readA = new Gpio(ePin(6), 'in')
const readB = new Gpio(ePin(0), 'in')
const readC = new Gpio(ePin(1), 'in')
const readD = new Gpio(ePin(2), 'in')
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
  // reset states (if applicable)
  columns.forEach(col => col.writeSync(Gpio.LOW))

  selectA.writeSync(1) // scanning initial state
  setTimeout(() => {
    // sync scanning to logic
    scanInterval = setInterval(scan, 100)
  }, 100)
  process.on('SIGINT', unregisterKeypad)
}

function scan() {
  determineKeyPressed()
  let nextPin = (selectPin + 1) % columns.length
  columns[selectPin].writeSync(0)
  columns[nextPin].writeSync(1)
  selectPin = nextPin
}

function determineKeyPressed() {
  let pinA = Boolean(readA.readSync()) // pin 0
  let pinB = Boolean(readB.readSync()) // pin 6
  let pinC = Boolean(readC.readSync()) // pin 5
  let pinD = Boolean(readD.readSync()) // pin 4
  if (pinA || pinB || pinC || pinD) console.log(selectPin, '=>', pinA, pinB, pinC, pinD)
  switch (selectPin) {
    case 0: // selectA, pin #3
      checkState(pinA, '1')
      checkState(pinB, '4')
      checkState(pinC, '7')
      checkState(pinD, '*')
      break
    case 1: // selectB, pin #2
      checkState(pinA, '2')
      checkState(pinB, '5')
      checkState(pinC, '8')
      checkState(pinD, '0')
      break
    case 2: // selectC, pin #1
      checkState(pinA, '3')
      checkState(pinB, '6')
      checkState(pinC, '9')
      checkState(pinD, '#')
      break

    default:
      break
  }
}

const checkState = (pin, key) => {
  if (pin && pin !== keyStates[key]) {
    kbe.emit('keyPressed', { key })
    keyStates[key] = pin
  }
  if (!pin && pin !== keyStates[key]) {
    kbe.emit('keyReleased', { key: key })
    keyStates[key] = pin
  }
}

function unregisterKeypad() {
  scanInterval = null
  for (let i = 0; i < keypadPins.length; i++) {
    keypadPins[i].unexport()
  }
}

export { registerKeypad, unregisterKeypad }
