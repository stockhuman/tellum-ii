import EventEmitter from 'events'
import { SerialPort } from 'serialport'

export const kbe = new EventEmitter()
const serial = new SerialPort({ path: '/dev/ttyUSB0', baudRate: 9600, autoOpen: true })

function registerKeypad() {
  // SerialPort.list().then(console.log)
  serial.on('data', readBuf)
}

const readBuf = (data: Buffer) => {
  kbe.emit('keyPressed', { key: data.toString('ascii').trim() })
}

export { registerKeypad }
