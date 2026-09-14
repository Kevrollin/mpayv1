import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import Alert from '../components/Alert'
import Logo from '../components/Logo'
import SocialAuthRow from '../components/SocialAuthRow'
import { sanitizeText, validateEmail, validatePassword } from '../lib/validation'

export default function Signup() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitError(null)

    const nextErrors = {
      email: validateEmail(email),
      password: validatePassword(password),
    }
    setErrors(nextErrors)
    if (nextErrors.email || nextErrors.password) return

    setSubmitting(true)
    try {
      const { data, error } = await supabase.auth.signUp({
        email: sanitizeText(email),
        password,
      })

      if (error) throw error

      if (data.session) {
        navigate('/dashboard')
      } else {
        setSuccess(true)
      }
    } catch (err) {
      console.error('Sign up failed:', err)
      setSubmitError(err?.message || 'Could not create your account. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center sm:px-6">
        <div className="card p-8">
          <h1 className="text-2xl font-bold text-ink">Check your inbox</h1>
          <p className="mt-3 text-sm text-muted">
            We sent a confirmation link to <span className="text-ink">{email}</span>. Confirm
            your email, then sign in. (Your real Supabase project must have email confirmations
            configured for this step.)
          </p>
          <Link to="/login" className="btn-primary mt-6 w-full">
            Go to sign in
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-md px-4 py-20 sm:px-6">
      <div className="card p-6 sm:p-8">
        <Logo className="mb-6 justify-center" showText={false} />

        <h1 className="text-left text-2xl font-bold text-ink">Register</h1>
        <p className="mt-1 mb-6 text-sm text-muted">
          Your dashboard will show only the payments you submit while signed in.
        </p>

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          {submitError && (
            <Alert variant="error" title="Sign up failed">
              {submitError}
            </Alert>
          )}

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
            <label className="label-base" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                className={`input-base pr-11 ${errors.password ? 'input-error' : ''}`}
                placeholder="At least 8 characters"
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
          </div>

          <button type="submit" className="btn-primary w-full !py-3" disabled={submitting}>
            {submitting ? 'Creating account…' : 'Register'}
          </button>
        </form>

        <SocialAuthRow />

        <p className="mt-6 text-center text-sm text-muted">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-brand hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  )
}
