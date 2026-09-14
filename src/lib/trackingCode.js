import { customAlphabet } from 'nanoid'

const alphabet = '0123456789ABCDEFGHJKLMNPQRSTUVWXYZ' // no I/O to avoid ambiguity
const nanoid = customAlphabet(alphabet, 8)

export function generateTrackingCode() {
  const raw = nanoid()
  return `TRX-${raw.slice(0, 4)}-${raw.slice(4, 8)}`
}
