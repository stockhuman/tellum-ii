declare module 'node-audiorecorder' {
  import { EventEmitter, Readable } from 'stream'

  type AudioRecorderOptions = {
    program: 'arecord' | 'rec' | 'sox'
    /** Recording device to use, e.g. `hw:1,0` */
    device: string
    /** Sample size. (only for `rec` and `sox`) */
    bits: number
    channels: number
    /** Encoding type. (only for `rec` and `sox`) */
    encoding: 'signed-integer' | 'binary'
    /** Encoding type. (only for `arecord`) */
    format:
      | 'S8'
      | 'U8'
      | 'S16_LE' /** Default */
      | 'S16_BE'
      | 'U16_LE'
      | 'U16_BE'
      | 'S24_LE'
      | 'S24_BE'
      | 'U24_LE'
      | 'U24_BE'
      | 'S32_LE'
      | 'S32_BE'
      | 'U32_LE'
      | 'U32_BE'
      | 'FLOAT_LE'
      | 'FLOAT_BE'
      | 'FLOAT64_LE'
      | 'FLOAT64_BE'
      | 'IEC958_SUBFRAME_LE'
      | 'IEC958_SUBFRAME_BE'
      | 'MU_LAW'
      | 'A_LAW'
      | 'IMA_ADPCM'
      | 'MPEG'
      | 'GSM'
      | 'S20_LE'
      | 'S20_BE'
      | 'U20_LE'
      | 'U20_BE'
      | 'SPECIAL'
      | 'S24_3LE'
      | 'S24_3BE'
      | 'U24_3LE'
      | 'U24_3BE'
      | 'S20_3LE'
      | 'S20_3BE'
      | 'U20_3LE'
      | 'U20_3BE'
      | 'S18_3LE'
      | 'S18_3BE'
      | 'U18_3LE'
      | 'U18_3BE'
      | 'G723_24'
      | 'G723_24_1B'
      | 'G723_40'
      | 'G723_40_1B'
      | 'DSD_U8'
      | 'DSD_U16_LE'
      | 'DSD_U32_LE'
      | 'DSD_U16_BE'
      | 'DSD_U32_BE'
    /** Sample rate */
    rate: number
    /** file format */
    type: 'wav'
    /** Only available when using `rec` or `sox`. Duration of silence in seconds before it stops recording. */
    silence: number
    /** Only available when using `rec` or `sox`. Silence threshold to start recording. */
    thresholdStart: number
    /** Only available when using `rec` or `sox`. Silence threshold to stop recording. */
    thresholdStop: number
    /** Only available when using `rec` or `sox`. Keep the silence in the recording. */
    keepSilence: boolean
  }

  export default class AudioRecorder extends EventEmitter {
    constructor(options: Partial<AudioRecorderOptions>, logger)
    start(): this
    stop(): this
    stream(): Readable
  }
}
