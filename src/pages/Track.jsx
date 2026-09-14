import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import Alert from '../components/Alert'
import Logo from '../components/Logo'
import StatusBadge from '../components/StatusBadge'
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
        .select('id, account_name, amount, currency, payment_mode, tracking_code, status, created_at')
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
      <Logo size="md" showText={false} className="mb-8 justify-center" />
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
          placeholder="TRX-XXXX-XXXX"
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
          <div className="card p-6 sm:p-8">
            <div className="flex items-center justify-between">
              <p className="font-mono text-lg font-bold text-brand">{record.tracking_code}</p>
              <StatusBadge status={record.status} />
            </div>
            <div className="mt-6 grid grid-cols-2 gap-5 text-sm">
              <div>
                <p className="text-faint">Account holder</p>
                <p className="font-medium text-ink">{record.account_name}</p>
              </div>
              <div>
                <p className="text-faint">Amount</p>
                <p className="font-medium text-ink">
                  {record.amount} {record.currency}
                </p>
              </div>
              <div>
                <p className="text-faint">Payment mode</p>
                <p className="font-medium capitalize text-ink">
                  {record.payment_mode?.replaceAll('_', ' ')}
                </p>
              </div>
              <div>
                <p className="text-faint">Created</p>
                <p className="font-medium text-ink">
                  {new Date(record.created_at).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
