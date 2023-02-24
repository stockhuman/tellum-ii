import EventEmitter from 'events'
import { SerialPort } from 'serialport'

export const kbe = new EventEmitter()
const serial = new SerialPort({ path: '/dev/ttyUSB0', baudRate: 9600, autoOpen: true })

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

function registerKeypad() {
  // SerialPort.list().then(console.log)
  serial.on('data', readBuf)
}

const readBuf = (data: Buffer) => {
  kbe.emit('keyPressed', { key: data.toString('ascii').trim() })
}

export { registerKeypad }
