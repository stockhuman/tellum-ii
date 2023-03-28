import EventEmitter from 'events'
import { SerialPort } from 'serialport'

export const hwe = new EventEmitter()
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

export { registerHardware }
