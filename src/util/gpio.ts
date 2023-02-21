type PINS =
  | 'E0'
  | 'E1'
  | 'E2'
  | 'E3'
  | 'E4'
  | 'E5'
  | 'E6'
  | 'E7'
  | 'E8'
  | 'E9'
  | 'E10'
  | 'E11'
  | 'E12'
  | 'E13'
  | 'E14'
  | 'E15'
  | 'E16' // POWERON
  | 'E17' // GPIO_LED
  | 'B0' // UART2-TX/JTAG-MS0
  | 'B1' // UART2-RX/JTAG-CK0
  | 'B2' // UART2-RTS/JTAG-DO0
  | 'B3' // UART2-CTS/I2C0-MCLK/JTAG-DI0
  | 'B4'

/**
 * Maps a given board pin ID into the logical GPIO port
 *
 * A pin value of `PE2` on the board ('E', 2) corresponds to `130`. The `P` is ignored.
 * @see https://github.com/OLIMEX/OLINUXINO/tree/master/HARDWARE/A64-OLinuXino
 * @see https://olimex.wordpress.com/2019/01/25/working-with-a20-olinuxino-or-som-gpios-when-using-new-armbian-based-a20-universal-linux-image/
 */
const pinToPort = (bay: string, pin: number): number => (bay.charCodeAt(0) - 'A'.charCodeAt(0)) * 32 + pin

/** Precomputed shortcut for pins in bay E. */
const ePin = (number: number) => 128 + number

export type { PINS }
export { pinToPort, ePin }
