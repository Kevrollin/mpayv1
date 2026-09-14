import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import Alert from '../components/Alert'
import StatusBadge from '../components/StatusBadge'

export default function Dashboard() {
  const { user } = useAuth()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function loadRequests() {
      setLoading(true)
      setError(null)
      try {
        const { data, error: fetchError } = await supabase
          .from('payment_requests')
          .select('id, account_name, amount, currency, payment_mode, tracking_code, status, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (fetchError) throw fetchError
        if (!cancelled) setRequests(data || [])
      } catch (err) {
        console.error('Failed to load dashboard payment requests:', err)
        if (!cancelled) setError(err?.message || 'Could not load your payment requests.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    if (user) loadRequests()

    return () => {
      cancelled = true
    }
  }, [user])

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold text-ink">Your dashboard</h1>
          <p className="mt-1 text-sm text-muted">
            Signed in as <span className="text-ink">{user?.email}</span>. Rows below are
            filtered to your account via Supabase Row Level Security.
          </p>
        </div>
        <Link to="/register" className="btn-primary">
          Register new payment
        </Link>
      </div>

      {error && (
        <Alert variant="error" title="Could not load payment requests" className="mb-6">
          {error}
        </Alert>
      )}

      {loading ? (
        <div className="card flex items-center justify-center p-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-500 border-t-transparent" />
        </div>
      ) : requests.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-muted">You haven't submitted any payments yet.</p>
          <Link to="/register" className="btn-primary mt-5 inline-flex">
            Register your first payment
          </Link>
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-line text-xs uppercase tracking-wide text-faint">
              <tr>
                <th className="px-5 py-3">Tracking code</th>
                <th className="px-5 py-3">Amount</th>
                <th className="px-5 py-3">Mode</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Created</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {requests.map((r) => (
                <tr key={r.id}>
                  <td className="px-5 py-3 font-mono text-brand">{r.tracking_code}</td>
                  <td className="px-5 py-3 text-ink">
                    {r.amount} {r.currency}
                  </td>
                  <td className="px-5 py-3 capitalize text-muted">
                    {r.payment_mode?.replaceAll('_', ' ')}
                  </td>
                  <td className="px-5 py-3">
                    <StatusBadge status={r.status} />
                  </td>
                  <td className="px-5 py-3 text-muted">
                    {new Date(r.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <Link
                      to={`/track/${r.tracking_code}`}
                      className="font-medium text-brand hover:underline"
                    >
                      Track
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
