import EventEmitter from 'events'
import { SerialPort } from 'serialport'

const hwe = new EventEmitter()
const serial = new SerialPort({ path: '/dev/ttyUSB0', baudRate: 9600, autoOpen: true })

function registerHardware() {
  // SerialPort.list().then(console.log)
  serial.on('data', readBuf)
}

const readBuf = (data: Buffer) => {
  const string = data.toString('ascii').trim()
  const parts = string.split(' ')
  const type = parts[0]
  const key = parts[1]

  hwe.emit('event', { type, key })
}

type HWEvent = {
  type: 'pressed' | 'released' | 'held' | 'hook' | 'unhook'
  key?: '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '*' | '#'
}

export { registerHardware, hwe, HWEvent }
