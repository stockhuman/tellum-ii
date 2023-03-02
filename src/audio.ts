import fs from 'fs'
import path from 'path'
import AudioRecorder from 'node-audiorecorder'

const audioRecorder = new AudioRecorder({ program: 'arecord', device: 'hw:1,0' }, console)

export function testAudio() {
  const audioDir = './audio-test'

  if (!fs.existsSync(audioDir)) {
    fs.mkdirSync(audioDir)
  }

  audioRecorder.on('error', () => console.warn('Recording error.'))
  audioRecorder.on('end', () => console.warn('Recording ended.'))

  const fileName = path.join(
    audioDir,
    Math.random()
      .toString(36)
      .replace(/[^0-9a-zA-Z]+/g, '')
      .concat('.wav'),
  )
  console.log('Writing new recording file at:', fileName)
  const fileStream = fs.createWriteStream(fileName, { encoding: 'binary' })
  audioRecorder.start().stream().pipe(fileStream)
  setTimeout(() => {
    audioRecorder.stop()
  }, 5000)
}

// this works:
// arecord -D hw:1,0 -d 10 -f dat audio.wav