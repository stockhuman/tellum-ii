/**
 * Due to time and application resource constraints, we're doing it this way.
 */

import fs from 'fs'
import path from 'path'

import spots from './spots'

const dbDir = path.resolve(__dirname, `../data`)
const dbFilePath = path.resolve(__dirname, `../data/db.json`)

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir)
}

if (!fs.existsSync(dbFilePath)) {
  const dbBlank = {
    items: [],
  }
  fs.writeFileSync(dbFilePath, JSON.stringify(dbBlank), { encoding: 'utf-8' })
}

type Item = {
  x: number
  y: number
  file: string
  time: string
}

class Database {
  items: Item[]
  constructor() {
    this.items = JSON.parse(fs.readFileSync(dbFilePath, { encoding: 'utf-8' }))
    console.log(this.items)
  }

  check(x: number, y: number) {
    let res: string[] = []

    // we find and add any manually curated sounds first
    let spot = spots.find(s => s.x === x && s.y === y)
    if (spot) res.push(spot.file)

    // add user files
    let userSounds = this.items.filter(s => s.x === x && s.y === y).map(s => s.file)
    if (userSounds.length > 0) {
      res.push(...userSounds)
    }
    return res
  }

  add(item: Item) {
    this.items.push(item)
    fs.writeFileSync(dbFilePath, JSON.stringify(this.items), { encoding: 'utf-8' })
  }
}

const db = new Database()

export { db }