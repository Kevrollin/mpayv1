import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import { CURRENCIES, PAYMENT_MODES } from '../lib/currencies'
import { generateTrackingCode } from '../lib/trackingCode'
import Alert from '../components/Alert'
import Logo from '../components/Logo'
import {
  sanitizeText,
  validateAccountName,
  validateAccountNumber,
  validateAmount,
  validateCurrency,
  validatePaymentMode,
} from '../lib/validation'

const initialForm = {
  accountName: '',
  accountNumber: '',
  amount: '',
  currency: 'USD',
  paymentMode: 'bank_transfer',
}

export default function Register() {
  const { user } = useAuth()
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState(null)
  const [copied, setCopied] = useState(false)

  const handleChange = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }))
    setErrors((errs) => ({ ...errs, [field]: null }))
  }

  const validate = () => {
    const nextErrors = {
      accountName: validateAccountName(form.accountName),
      accountNumber: validateAccountNumber(form.accountNumber),
      amount: validateAmount(form.amount),
      currency: validateCurrency(form.currency),
      paymentMode: validatePaymentMode(form.paymentMode),
    }
    setErrors(nextErrors)
    return Object.values(nextErrors).every((v) => !v)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitError(null)

    if (!validate()) return

    setSubmitting(true)
    try {
      const trackingCode = generateTrackingCode()
      const payload = {
        account_name: sanitizeText(form.accountName),
        account_number: sanitizeText(form.accountNumber),
        amount: Number(form.amount),
        currency: form.currency,
        payment_mode: form.paymentMode,
        tracking_code: trackingCode,
        status: 'pending',
        user_id: user?.id ?? null,
      }

      const { data, error } = await supabase
        .from('payment_requests')
        .insert(payload)
        .select()
        .single()

      if (error) throw error

      setResult(data)
      setForm(initialForm)
    } catch (err) {
      console.error('Failed to submit payment request:', err)
      setSubmitError(
        err?.message || 'Something went wrong while submitting your payment request.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  const handleCopy = async () => {
    if (!result) return
    try {
      await navigator.clipboard.writeText(result.tracking_code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Clipboard copy failed:', err)
      setSubmitError('Could not copy to clipboard. Please copy the code manually.')
    }
  }

  if (result) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 sm:px-6">
        <div className="card p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent-500/15 text-brand">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className="mt-5 text-2xl font-bold text-ink">Payment request registered</h1>
          <p className="mt-2 text-sm text-muted">
            Save your tracking code — you'll need it to check status or continue to checkout.
          </p>

          <div className="mt-6 rounded-lg border border-line bg-surface-2 p-4">
            <p className="text-xs uppercase tracking-wide text-faint">Tracking code</p>
            <p className="mt-1 font-mono text-2xl font-bold text-brand">
              {result.tracking_code}
            </p>
            <button onClick={handleCopy} className="btn-secondary mt-4 w-full">
              {copied ? 'Copied!' : 'Copy to clipboard'}
            </button>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 text-left text-sm">
            <div>
              <p className="text-faint">Amount</p>
              <p className="font-semibold text-ink">
                {result.amount} {result.currency}
              </p>
            </div>
            <div>
              <p className="text-faint">Status</p>
              <p className="font-semibold text-ink capitalize">{result.status}</p>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link to={`/track/${result.tracking_code}`} className="btn-primary flex-1">
              Track this request
            </Link>
            <Link
              to={`/checkout?code=${result.tracking_code}`}
              className="btn-secondary flex-1"
            >
              Continue to checkout
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <div className="card p-6 sm:p-8">
        <Logo className="mb-6 justify-center" />

        <h1 className="text-left text-2xl font-bold text-ink">Register a payment</h1>
        <p className="mt-1 mb-6 text-sm text-muted">
          Enter the payment details below to generate a tracking code and continue to checkout.
        </p>

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          {submitError && (
            <Alert variant="error" title="Could not register payment">
              {submitError}
            </Alert>
          )}

          <div>
            <label className="label-base" htmlFor="accountName">
              Account holder name
            </label>
            <input
              id="accountName"
              type="text"
              className={`input-base ${errors.accountName ? 'input-error' : ''}`}
              placeholder="Jane Doe"
              value={form.accountName}
              onChange={handleChange('accountName')}
              maxLength={100}
            />
            {errors.accountName && <p className="error-text">{errors.accountName}</p>}
          </div>

          <div>
            <label className="label-base" htmlFor="accountNumber">
              Account number
            </label>
            <input
              id="accountNumber"
              type="text"
              className={`input-base ${errors.accountNumber ? 'input-error' : ''}`}
              placeholder="e.g. 0123456789"
              value={form.accountNumber}
              onChange={handleChange('accountNumber')}
              maxLength={34}
            />
            {errors.accountNumber && <p className="error-text">{errors.accountNumber}</p>}
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className="label-base" htmlFor="amount">
                Amount
              </label>
              <input
                id="amount"
                type="number"
                step="any"
                inputMode="decimal"
                className={`input-base ${errors.amount ? 'input-error' : ''}`}
                placeholder="100.00"
                value={form.amount}
                onChange={handleChange('amount')}
              />
              {errors.amount && <p className="error-text">{errors.amount}</p>}
            </div>

            <div>
              <label className="label-base" htmlFor="currency">
                Currency
              </label>
              <select
                id="currency"
                className={`input-base ${errors.currency ? 'input-error' : ''}`}
                value={form.currency}
                onChange={handleChange('currency')}
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code} — {c.name}
                  </option>
                ))}
              </select>
              {errors.currency && <p className="error-text">{errors.currency}</p>}
            </div>
          </div>

          <div>
            <label className="label-base" htmlFor="paymentMode">
              Payment mode
            </label>
            <select
              id="paymentMode"
              className={`input-base ${errors.paymentMode ? 'input-error' : ''}`}
              value={form.paymentMode}
              onChange={handleChange('paymentMode')}
            >
              {PAYMENT_MODES.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
            {errors.paymentMode && <p className="error-text">{errors.paymentMode}</p>}
          </div>

          <button type="submit" className="btn-primary w-full !py-3" disabled={submitting}>
            {submitting ? 'Registering…' : 'Register Payment'}
          </button>
        </form>
      </div>
    </div>
  )
}
