import { EventEmitter, Readable } from 'stream'
import { spawn } from 'child_process'

type AudioRecorderOptions = {
  /** Recording device to use, e.g. `hw:1,0` */
  device: string
  channels: number
  /** Sample rate */
  rate: number
}

class AudioRecorder extends EventEmitter {
  program: 'arecord'
  device: string
  rate: number
  logger: any

  private childProcess: any
  private command: { arguments: any[]; options: { encoding: string; env: NodeJS.ProcessEnv } }

  constructor(options: Partial<AudioRecorderOptions>, logger: object) {
    super()

    this.program = 'arecord'
    this.device = options.device || 'hw:1,0'
    this.rate = options.rate || 16000
    this.childProcess = null
    this.logger = logger

    this.command = {
      arguments: [
        // Show no progress
        '-q',
        // Sample rate
        '-r',
        this.rate.toString(),
        // Format type
        '-t',
        'wav',
      ],
      options: {
        encoding: 'binary',
        env: Object.assign({}, process.env),
      },
    }

    if (this.device) {
      this.command.arguments.unshift('-D', this.device)
    }
  
    this.command.arguments.push(
      // Format type
      '-f',
      'dat',
    )

    if (this.logger) {
      // Log command.
      this.logger.log(`[REC] Command '${this.program} ${this.command.arguments.join(' ')}'`)
    }

    return this
  }

  /**
   * Creates and starts the audio recording process.
   */
  start(): AudioRecorder {
    if (this.childProcess) {
      if (this.logger) {
        this.logger.warn('[REC] Process already active, killed old one started new process.')
      }
      this.childProcess.kill()
    }

    // Create new child process and give the recording commands.
    this.childProcess = spawn(this.program, this.command.arguments, this.command.options)

    // Store this in `self` so it can be accessed in the callback.
    let self = this
    this.childProcess.on('close', function (exitCode) {
      if (self.logger) {
        self.logger.log(`[REC] Exit code '${exitCode}'.`)
      }
      self.emit('close', exitCode)
    })
    this.childProcess.on('error', function (error) {
      self.emit('error', error)
    })
    this.childProcess.on('end', function () {
      self.emit('end')
    })

    if (this.logger) {
      this.logger.log('[REC] Started recording.')
    }

    return this
  }

  /**
   * Stops and removes the audio recording process.
   */
  stop(): AudioRecorder {
    if (!this.childProcess) {
      if (this.logger) {
        this.logger.warn('[REC] Unable to stop recording, no process active.')
      }
      return this
    }

    this.childProcess.kill()
    this.childProcess = null

    if (this.logger) {
      this.logger.log('[REC] Stopped recording.')
    }

    return this
  }

  /**
   * Get the audio stream of the recording process.
   */
  stream(): Readable {
    if (!this.childProcess) {
      if (this.logger) {
        this.logger.warn(
          '[REC] Unable to retrieve stream, because no process not active. Call the start or resume function first.',
        )
      }
      return null
    }

    return this.childProcess.stdout
  }
}

export default AudioRecorder
