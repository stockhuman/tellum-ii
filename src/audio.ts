import fs from 'fs'
import path from 'path'
import { exec } from 'child_process'
import AudioRecorder from './audiorecorder'

const audioRecorder = new AudioRecorder({ rate: 8000 }, console)
audioRecorder.on('error', () => console.warn('Recording error.'))
audioRecorder.on('end', () => console.warn('Recording ended.'))

/** Plays a file by ID from the `data` directory */
export async function play(id: string) {
  let e = exec(`aplay ${path.resolve(__dirname, `../data/audio/${id}.wav`)}`)
  return new Promise((resolve, reject) => {
    e.addListener('close', resolve)
    e.addListener('error', reject)
  })
}

export async function say(text: string) {
  // lmao
  let e = exec(`espeak-ng -z "${text.replaceAll('-', 'negative ')}"`)
  return new Promise((resolve, reject) => {
    e.addListener('exit', resolve)
    e.addListener('close', resolve)
    e.addListener('error', reject)
  })
}

export function stop() {
  exec('killall aplay; killall espeak-ng')
}

/**
 * Returns an audiorecorder stream.
 * One must call `stop()` on it.
 */
export function record(id: string) {
  const fileName = path.resolve(__dirname, `../data/audio/${id}.wav`)
  const fileStream = fs.createWriteStream(fileName, { encoding: 'binary' })
  audioRecorder.start().stream().pipe(fileStream)
  return audioRecorder
}

export async function testAudio(skiprec = false) {
  const audioDir = path.resolve(__dirname, '../data/audio')

  if (!fs.existsSync(audioDir)) {
    fs.mkdirSync(audioDir)
  }

  console.info('[Audio] Playing sound')
  await play('sinetest')

  if (!skiprec) {
    const fileName = path.join(audioDir, `test.wav`)
    console.info('[Audio] Testing mic, writing to', fileName)
    const fileStream = fs.createWriteStream(fileName, { encoding: 'binary' })
    audioRecorder.start().stream().pipe(fileStream)
    await delay(5000)
    audioRecorder.stop()
    await delay(500)
    await play('test')
    console.info('[Audio] Mic test complete')
  }
}

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// this works:
// sudo arecord -D hw:1,0 -d 10 -f dat audio.wav

// and this works for playback
// sudo aplay -D hw:1,0 audio.wav
