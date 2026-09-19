import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../lib/supabaseClient'
import { generateTrackingCode } from '../lib/trackingCode'
import Alert from '../components/Alert'

const PROCESSING_STEPS = [
  { text: 'Validating request', duration: 900 },
  { text: 'Contacting processor', duration: 1300 },
  { text: 'Finalizing', duration: 900 },
]

const FAILURE_REASONS = [
  'Insufficient balance',
  'Processor timeout',
  'Card declined by issuer',
]

function randomAmount() {
  return (Math.random() * 480 + 20).toFixed(2)
}

export default function Checkout() {
  const [searchParams] = useSearchParams()
  const code = searchParams.get('code')
  const force = searchParams.get('force') // dev toggle: force=success | force=fail

  const [phase, setPhase] = useState('loading') // loading | error | review | processing | success | failed | canceled
  const [invoice, setInvoice] = useState(null)
  const [error, setError] = useState(null)
  const [processingStepIndex, setProcessingStepIndex] = useState(0)
  const [failureReason, setFailureReason] = useState(null)
  const [actionError, setActionError] = useState(null)
  const timeouts = useRef([])

  useEffect(() => {
    let cancelled = false

    async function loadOrCreateInvoice() {
      setPhase('loading')
      setError(null)
      try {
        let row = null

        if (code) {
          const { data, error: fetchError } = await supabase
            .from('payment_requests')
            .select('*')
            .eq('tracking_code', code.toUpperCase())
            .maybeSingle()

          if (fetchError) throw fetchError
          if (!data) {
            throw new Error(`No payment request found for tracking code ${code}.`)
          }
          row = data
        } else {
          const payload = {
            account_name: 'Checkout Merchant',
            account_number: 'MERCHANT0001',
            amount: Number(randomAmount()),
            currency: 'USD',
            payment_mode: 'card',
            tracking_code: generateTrackingCode(),
            status: 'pending',
          }
          const { data, error: insertError } = await supabase
            .from('payment_requests')
            .insert(payload)
            .select()
            .single()

          if (insertError) throw insertError
          row = data
        }

        if (cancelled) return
        setInvoice(row)

        setPhase('review')
      } catch (err) {
        console.error('Failed to load checkout invoice:', err)
        if (!cancelled) {
          setError(err?.message || 'Could not load the checkout invoice.')
          setPhase('error')
        }
      }
    }

    loadOrCreateInvoice()

    return () => {
      cancelled = true
      timeouts.current.forEach(clearTimeout)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code])

  async function updateStatus(row, status) {
    const { error: updateError } = await supabase
      .from('payment_requests')
      .update({ status })
      .eq('id', row.id)

    if (updateError) throw updateError
  }

  async function handleCancel(row) {
    const target = row || invoice
    setActionError(null)
    try {
      await updateStatus(target, 'canceled')
      setPhase('canceled')
    } catch (err) {
      console.error('Failed to record cancellation:', err)
      setActionError(err?.message || 'Could not record the cancellation.')
      setPhase('canceled')
    }
  }

  function runProcessingSequence() {
    setPhase('processing')
    setProcessingStepIndex(0)

    let elapsed = 0
    PROCESSING_STEPS.forEach((step, i) => {
      elapsed += i === 0 ? 0 : PROCESSING_STEPS[i - 1].duration
      const t = setTimeout(() => setProcessingStepIndex(i), elapsed)
      timeouts.current.push(t)
    })

    const totalDuration = PROCESSING_STEPS.reduce((sum, s) => sum + s.duration, 0)
    const finalTimeout = setTimeout(() => resolveOutcome(), totalDuration)
    timeouts.current.push(finalTimeout)
  }

  async function resolveOutcome() {
    const isSuccess = force === 'success' ? true : force === 'fail' ? false : Math.random() < 0.7

    try {
      if (isSuccess) {
        await updateStatus(invoice, 'completed')
        setPhase('success')
      } else {
        const reason = FAILURE_REASONS[Math.floor(Math.random() * FAILURE_REASONS.length)]
        setFailureReason(reason)
        await updateStatus(invoice, 'failed')
        setPhase('failed')
      }
    } catch (err) {
      console.error('Failed to update payment status after processing:', err)
      setActionError(err?.message || 'Processed, but failed to save the outcome.')
      setPhase(isSuccess ? 'success' : 'failed')
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-16 sm:px-6">
      <AnimatePresence mode="wait">
        {phase === 'loading' && (
          <motion.div key="loading" {...fadeProps} className="card flex flex-col items-center gap-4 p-10">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-500 border-t-transparent" />
            <p className="text-sm text-muted">Preparing invoice…</p>
          </motion.div>
        )}

        {phase === 'error' && (
          <motion.div key="error" {...fadeProps}>
            <Alert variant="error" title="Could not load checkout">
              {error}
            </Alert>
            <Link to="/" className="btn-secondary mt-6 w-full">
              Back to home
            </Link>
          </motion.div>
        )}

        {phase === 'review' && invoice && (
          <motion.div key="review" {...fadeProps} className="card p-6 sm:p-8">
            <h1 className="text-xl font-bold text-ink">Review invoice</h1>
            <p className="mt-1 text-sm text-muted">Confirm the details before you pay.</p>

            <div className="mt-6 space-y-3 rounded-lg border border-line bg-surface-2 p-4 text-sm">
              <Row label="Merchant" value="KM Pay Merchant" />
              <Row label="Tracking code" value={invoice.tracking_code} mono />
              <Row label="Account holder" value={invoice.account_name} />
              <Row label="Payment mode" value={invoice.payment_mode?.replaceAll('_', ' ')} capitalize />
              <Row label="Amount" value={`${invoice.amount} ${invoice.currency}`} bold />
            </div>

            {actionError && (
              <Alert variant="error" className="mt-4" title="Action error">
                {actionError}
              </Alert>
            )}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button onClick={runProcessingSequence} className="btn-primary flex-1">
                Confirm Payment
              </button>
              <Link to="/login" className="btn-danger flex-1 text-center">
                Cancel
              </Link>
            </div>
          </motion.div>
        )}

        {phase === 'processing' && (
          <motion.div key="processing" {...fadeProps} className="card flex flex-col items-center gap-6 p-10 text-center">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-accent-500 border-t-transparent" />
            <div>
              <p className="text-lg font-semibold text-ink">
                {PROCESSING_STEPS[processingStepIndex].text}…
              </p>
            </div>
            <div className="flex gap-2">
              {PROCESSING_STEPS.map((step, i) => (
                <span
                  key={step.text}
                  className={`h-1.5 w-10 rounded-full transition ${
                    i <= processingStepIndex ? 'bg-accent-500' : 'bg-line'
                  }`}
                />
              ))}
            </div>
          </motion.div>
        )}

        {phase === 'success' && invoice && (
          <motion.div key="success" {...fadeProps} className="card p-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent-500/15 text-brand">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h1 className="mt-5 text-2xl font-bold text-ink">Payment successful</h1>
            <p className="mt-2 text-sm text-muted">
              Tracking code <span className="font-mono text-brand">{invoice.tracking_code}</span> is
              now marked <span className="font-semibold text-ink">completed</span>.
            </p>
            {actionError && (
              <Alert variant="warning" className="mt-4 text-left" title="Note">
                {actionError}
              </Alert>
            )}
            <Link to={`/track/${invoice.tracking_code}`} className="btn-primary mt-6 w-full">
              View tracking status
            </Link>
            <Link to="/" className="btn-secondary mt-3 w-full">
              Back to home
            </Link>
          </motion.div>
        )}

        {phase === 'failed' && invoice && (
          <motion.div key="failed" {...fadeProps} className="card p-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-danger-soft/15 text-danger-text">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h1 className="mt-5 text-2xl font-bold text-ink">Payment failed</h1>
            <p className="mt-2 text-sm text-muted">{failureReason}</p>
            <p className="mt-1 text-xs text-faint">
              Tracking code <span className="font-mono text-muted">{invoice.tracking_code}</span> is
              now marked <span className="font-semibold text-ink">failed</span>.
            </p>
            {actionError && (
              <Alert variant="warning" className="mt-4 text-left" title="Note">
                {actionError}
              </Alert>
            )}
            <Link to={`/track/${invoice.tracking_code}`} className="btn-secondary mt-6 w-full">
              View tracking status
            </Link>
            <Link to="/" className="btn-primary mt-3 w-full">
              Back to home
            </Link>
          </motion.div>
        )}

        {phase === 'canceled' && invoice && (
          <motion.div key="canceled" {...fadeProps} className="card p-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-neutral-soft/15 text-muted">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h1 className="mt-5 text-2xl font-bold text-ink">Payment canceled</h1>
            <p className="mt-2 text-sm text-muted">
              You canceled this checkout before any processing began. Tracking code{' '}
              <span className="font-mono text-muted">{invoice.tracking_code}</span> is now marked{' '}
              <span className="font-semibold text-ink">canceled</span>.
            </p>
            {actionError && (
              <Alert variant="warning" className="mt-4 text-left" title="Note">
                {actionError}
              </Alert>
            )}
            <Link to={`/track/${invoice.tracking_code}`} className="btn-secondary mt-6 w-full">
              View tracking status
            </Link>
            <Link to="/" className="btn-primary mt-3 w-full">
              Back to home
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const fadeProps = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.25 },
}

function Row({ label, value, mono, bold, capitalize }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-faint">{label}</span>
      <span
        className={[
          'text-ink',
          mono ? 'font-mono' : '',
          bold ? 'font-bold text-brand' : 'font-medium',
          capitalize ? 'capitalize' : '',
        ].join(' ')}
      >
        {value}
      </span>
    </div>
  )
}
