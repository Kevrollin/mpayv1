export function sanitizeText(value) {
  return String(value ?? '')
    .trim()
    .replace(/[<>]/g, '')
}

export function isNonEmpty(value) {
  return sanitizeText(value).length > 0
}

export function validateAccountName(value) {
  const v = sanitizeText(value)
  if (!v) return 'Account holder name is required.'
  if (v.length < 2) return 'Name must be at least 2 characters.'
  if (v.length > 100) return 'Name must be under 100 characters.'
  if (!/^[a-zA-Z\s.'-]+$/.test(v)) return 'Name contains invalid characters.'
  return null
}

export function validateAccountNumber(value) {
  const v = sanitizeText(value)
  if (!v) return 'Account number is required.'
  if (!/^[a-zA-Z0-9]{6,34}$/.test(v)) {
    return 'Account number must be 6-34 alphanumeric characters.'
  }
  return null
}

export function validateAmount(value) {
  const v = sanitizeText(value)
  if (!v) return 'Amount is required.'
  const n = Number(v)
  if (Number.isNaN(n)) return 'Amount must be a number.'
  if (n <= 0) return 'Amount must be greater than zero.'
  if (n > 1_000_000_000) return 'Amount is too large.'
  return null
}

export function validateCurrency(value) {
  if (!isNonEmpty(value)) return 'Please enter a currency.'
  return null
}

export function validatePaymentMode(value) {
  if (!isNonEmpty(value)) return 'Please enter a payment mode.'
  return null
}

export function validateEmail(value) {
  const v = sanitizeText(value)
  if (!v) return 'Email is required.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'Enter a valid email address.'
  return null
}

export function validatePassword(value) {
  const v = String(value ?? '')
  if (!v) return 'Password is required.'
  if (v.length < 8) return 'Password must be at least 8 characters.'
  return null
}

export function validateTrackingCode(value) {
  const v = sanitizeText(value).toUpperCase()
  if (!v) return 'Enter a tracking code.'
  if (!/^TRX-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(v)) {
    return 'Tracking code format looks like TRX-XXXX-XXXX.'
  }
  return null
}
