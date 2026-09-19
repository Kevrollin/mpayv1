import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import Alert from '../components/Alert'
import Logo from '../components/Logo'
import { validateTrackingCode } from '../lib/validation'

export default function Track() {
  const { code } = useParams()
  const navigate = useNavigate()
  const [input, setInput] = useState(code || '')
  const [inputError, setInputError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [record, setRecord] = useState(null)

  const runLookup = async (trackingCode) => {
    setLoading(true)
    setError(null)
    setRecord(null)
    try {
      const { data, error: fetchError } = await supabase
        .from('payment_requests')
        .select('id, account_name, account_number, amount, currency, payment_mode, tracking_code, status, created_at')
        .eq('tracking_code', trackingCode)
        .maybeSingle()

      if (fetchError) throw fetchError

      if (!data) {
        setError('No payment request was found for that tracking code.')
      } else {
        setRecord(data)
      }
    } catch (err) {
      console.error('Failed to look up tracking code:', err)
      setError(err?.message || 'Something went wrong while looking up this tracking code.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (code) {
      const normalized = code.trim().toUpperCase()
      setInput(normalized)
      const validationError = validateTrackingCode(normalized)
      if (validationError) {
        setInputError(validationError)
        return
      }
      runLookup(normalized)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code])

  const handleSubmit = (e) => {
    e.preventDefault()
    const normalized = input.trim().toUpperCase()
    const validationError = validateTrackingCode(normalized)
    setInputError(validationError)
    if (validationError) return
    navigate(`/track/${normalized}`)
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-16 sm:px-6">
      <Logo size="compact" showText={false} className="mb-8 justify-center" />
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-ink">Track a payment</h1>
        <p className="mt-2 text-sm text-muted">
          Paste a tracking code to view its current status.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="card flex flex-col gap-3 p-6 sm:flex-row sm:p-4">
        <input
          type="text"
          className={`input-base sm:flex-1 ${inputError ? 'input-error' : ''}`}
          placeholder="TRX-123"
          value={input}
          onChange={(e) => {
            setInput(e.target.value)
            setInputError(null)
          }}
          maxLength={20}
        />
        <button type="submit" className="btn-primary sm:w-auto" disabled={loading}>
          {loading ? 'Searching…' : 'Track'}
        </button>
      </form>
      {inputError && <p className="error-text px-1">{inputError}</p>}

      <div className="mt-6">
        {error && (
          <Alert variant="error" title="Lookup failed">
            {error}
          </Alert>
        )}

        {record && (
          <div className="overflow-hidden rounded-[22px] border border-slate-200 bg-white text-slate-900 shadow-xl shadow-slate-950/10">
            <div className="bg-navy-950 px-6 py-6 text-white sm:px-8">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-3xl font-black tracking-tight">
                    Bit<span className="text-rose-500">Valve</span>
                  </p>
                  <p className="mt-2 text-sm font-semibold uppercase tracking-[0.18em] text-slate-300">
                    Escrow transaction
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-slate-600 bg-slate-800 text-amber-400">
                  <span className="h-3.5 w-3.5 rounded-full bg-amber-400 shadow-[0_0_14px_rgba(251,191,36,0.8)]" />
                </div>
              </div>
            </div>

            <div className="px-6 pb-7 pt-8 text-center sm:px-8">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">
                Total amount
              </p>
              <p className="mt-3 text-5xl font-black tracking-tight text-slate-950 sm:text-6xl">
                {record.currency}{Number(record.amount).toFixed(2)}
              </p>
              <p className="mt-3 text-lg text-slate-500">Funds secured in escrow</p>
            </div>

            <div className="border-t border-slate-200 px-6 py-5 sm:px-8">
              <ReceiptRow label="Transaction ID" value={record.tracking_code} strong />
              <ReceiptRow label="Date" value={formatDate(record.created_at)} strong />
              <ReceiptRow label="Time" value={formatTime(record.created_at)} strong />
              <ReceiptRow label="Receiver" value={record.account_name} strong />
              <ReceiptRow label="Account" value={record.account_number || 'Not provided'} strong />
              <ReceiptRow label="Payment method" value={formatPaymentMode(record.payment_mode)} strong />
              <ReceiptRow label="Amount" value={`${record.currency} ${Number(record.amount).toFixed(2)}`} strong />
              <ReceiptRow label="Tax / VAT" value={`${record.currency}0.00`} strong last />
            </div>

            <div className="mx-6 mb-7 flex gap-4 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-5 text-left sm:mx-8">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-xl font-bold text-white">
                ✓
              </div>
              <div>
                <p className="font-bold text-emerald-800">Funds are in escrow</p>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">
                  The payment has been submitted and is currently protected until the receiver takes action.
                </p>
              </div>
            </div>

            <div className="border-t border-slate-200 bg-slate-50 px-6 py-6 sm:px-8">
              <p className="text-base font-bold text-slate-800">Receiver actions</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-700"
                >
                  Accept Payment
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center rounded-lg bg-red-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-700"
                >
                  Cancel / Dispute
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function ReceiptRow({ label, value, strong, last }) {
  return (
    <div className={`flex items-center justify-between gap-4 py-3.5 text-sm sm:text-base ${last ? '' : 'border-b border-slate-200'}`}>
      <span className="text-slate-500">{label}</span>
      <span className={strong ? 'text-right font-bold text-slate-900' : 'text-right text-slate-900'}>{value}</span>
    </div>
  )
}

function formatDate(value) {
  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function formatTime(value) {
  return new Date(value).toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
}

function formatPaymentMode(value) {
  return value?.replaceAll('_', ' ').replace(/\b\w/g, (character) => character.toUpperCase()) || 'Not provided'
}
