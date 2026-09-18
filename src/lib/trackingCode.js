import { customAlphabet } from 'nanoid'

const nanoid = customAlphabet('0123456789', 3)

export function generateTrackingCode() {
  return `TRX-${nanoid()}`
}
