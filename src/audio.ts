import fs from 'fs'
import path from 'path'
import AudioRecorder from './audiorecorder'

const audioRecorder = new AudioRecorder({ rate: 8000 }, console)

export function testAudio() {
  const audioDir = './audio-test'

  if (!fs.existsSync(audioDir)) {
    fs.mkdirSync(audioDir)
  }

  audioRecorder.on('error', () => console.warn('Recording error.'))
  audioRecorder.on('end', () => console.warn('Recording ended.'))

  const fileName = path.join(audioDir, `${Date.now()}.wav`)
  console.log('Writing new recording file at:', fileName)
  const fileStream = fs.createWriteStream(fileName, { encoding: 'binary' })
  audioRecorder.start().stream().pipe(fileStream)
  setTimeout(() => {
    audioRecorder.stop()
  }, 5000)
}

// this works:
// sudo arecord -D hw:1,0 -d 10 -f dat audio.wav

// and this works for playback
// sudo aplay -D hw:1,0 audio.wav 