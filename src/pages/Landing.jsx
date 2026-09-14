import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CURRENCIES } from '../lib/currencies'

const steps = [
  {
    title: '1. Register a payment',
    body: 'Enter an account, amount, currency, and payment mode. We generate a unique tracking code and store your request securely.',
  },
  {
    title: '2. Confirm checkout',
    body: 'Review the invoice and confirm — you\'ll see a real-time processing status as the payment goes through.',
  },
  {
    title: '3. Track the status',
    body: 'Paste your tracking code on the Track Payment page to see its current status at any time.',
  },
]

const trustBadges = [
  { label: 'Row-Level Data Security', detail: 'Every account only ever sees its own records' },
  { label: 'Encrypted Connections', detail: 'All traffic travels over HTTPS/TLS' },
  { label: 'Secure Account Access', detail: 'Password or one-time email code sign-in' },
  { label: 'Built on Supabase', detail: 'Modern, managed cloud infrastructure' },
]

const displayedCurrencies = CURRENCIES.filter((c) =>
  ['USD', 'EUR', 'GBP', 'JPY', 'NGN', 'KES', 'INR', 'ZAR', 'BRL', 'AUD', 'CAD', 'BTC', 'ETH', 'USDT', 'USDC', 'CHF'].includes(
    c.code
  )
)

export default function Landing() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-line">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            background:
              'radial-gradient(600px circle at 20% 0%, rgba(190,242,100,0.15), transparent 60%), radial-gradient(500px circle at 90% 20%, rgba(190,242,100,0.1), transparent 60%)',
          }}
        />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mx-auto max-w-3xl text-center"
          >
            <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-ink sm:text-5xl lg:text-6xl">
              Payments, <span className="text-brand">handled simply.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base text-muted sm:text-lg">
              KM Pay lets you register a payment, track it by a unique code, and complete
              checkout — all in one clean, fast flow.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link to="/track" className="btn-primary w-full sm:w-auto">
                Track Payment
              </Link>
              <Link to="/login" className="btn-secondary w-full sm:w-auto">
                Accept Payment
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-ink">How it works</h2>
          <p className="mt-3 text-muted">Three simple steps from registration to tracking.</p>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {steps.map((step) => (
            <div key={step.title} className="card p-6">
              <h3 className="text-lg font-semibold text-brand">{step.title}</h3>
              <p className="mt-2 text-sm text-muted">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Supported currencies */}
      <section className="border-t border-line bg-surface-2/40">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-ink">Supported currencies</h2>
            <p className="mt-3 text-muted">
              A full range of world currencies, plus popular crypto assets for wallet payments.
            </p>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
            {displayedCurrencies.map((c) => (
              <div
                key={c.code}
                className="card flex flex-col items-center justify-center gap-1 py-4 text-center"
              >
                <span className="text-sm font-bold text-ink">{c.code}</span>
                <span className="text-[11px] text-faint">{c.name.split(' ')[0]}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust badges */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-ink">Built with security in mind</h2>
        </div>
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {trustBadges.map((badge) => (
            <div key={badge.label} className="card p-5">
              <p className="text-sm font-semibold text-ink">{badge.label}</p>
              <p className="mt-1 text-xs text-faint">{badge.detail}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
