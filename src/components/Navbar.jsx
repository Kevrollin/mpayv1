import { useEffect, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import ThemeToggle from './ThemeToggle'
import Logo from './Logo'

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/register', label: 'Register Payment' },
  { to: '/track', label: 'Track Payment' },
]

const socialLinks = [
  {
    name: 'X (Twitter)',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.9 2H22l-7.6 8.7L23.3 22H16.6l-5.3-6.9L5.2 22H2l8.1-9.3L1 2h6.9l4.8 6.3L18.9 2zm-1.2 18h1.7L7.4 4H5.6l12.1 16z" />
      </svg>
    ),
  },
  {
    name: 'Instagram',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    name: 'LinkedIn',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M4.98 3.5C4.98 4.88 3.9 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM.24 8.25h4.5V23H.24V8.25zM8.25 8.25h4.3v2.02h.06c.6-1.1 2.06-2.26 4.24-2.26 4.53 0 5.37 2.9 5.37 6.68V23h-4.5v-6.8c0-1.62-.03-3.7-2.26-3.7-2.27 0-2.62 1.75-2.62 3.58V23h-4.5V8.25z" />
      </svg>
    ),
  },
]

export default function Navbar() {
  const { user, signOut } = useAuth()
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  const handleSignOut = async () => {
    try {
      await signOut()
      navigate('/')
      setOpen(false)
    } catch (err) {
      console.error('Sign out failed:', err)
    }
  }

  return (
    <>
      <header className="relative border-b border-line bg-surface-2/80 backdrop-blur-md">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <Link to="/" onClick={() => setOpen(false)}>
            <Logo size="sm" />
          </Link>

          <div className="hidden items-center gap-6 md:flex">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) =>
                  `text-sm font-medium transition ${
                    isActive ? 'text-brand' : 'text-muted hover:text-ink'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <ThemeToggle />
            {user ? (
              <>
                <Link to="/dashboard" className="btn-secondary !py-2 !px-4 text-sm">
                  Dashboard
                </Link>
                <button onClick={handleSignOut} className="btn-danger !py-2 !px-4 text-sm">
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-secondary !py-2 !px-4 text-sm">
                  Accept Payment
                </Link>
                <Link to="/register" className="btn-primary !py-2 !px-4 text-sm">
                  Register Payment
                </Link>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <button
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-line text-muted"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </nav>
      </header>

      {open && (
        <div className="fixed inset-0 z-50 flex flex-col bg-app md:hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <Link to="/" onClick={() => setOpen(false)}>
              <Logo size="sm" />
            </Link>
            <button
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-line text-muted"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <div className="flex flex-1 flex-col items-center justify-center gap-8 px-6 text-center">
            <div className="flex flex-col items-center gap-6">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/'}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `text-2xl font-semibold ${isActive ? 'text-brand' : 'text-ink'}`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </div>

            <div className="flex w-full max-w-xs flex-col items-center gap-3">
              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    className="btn-secondary w-full"
                    onClick={() => setOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <button onClick={handleSignOut} className="btn-danger w-full">
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="btn-secondary w-full"
                    onClick={() => setOpen(false)}
                  >
                    Accept Payment
                  </Link>
                  <Link
                    to="/register"
                    className="btn-primary w-full"
                    onClick={() => setOpen(false)}
                  >
                    Register Payment
                  </Link>
                </>
              )}
            </div>

            <div className="flex items-center gap-4">
              {socialLinks.map((s) => (
                <span
                  key={s.name}
                  aria-label={s.name}
                  title={`${s.name} (not linked yet)`}
                  className="flex h-10 w-10 cursor-default items-center justify-center rounded-full border border-line text-faint"
                >
                  {s.icon}
                </span>
              ))}
            </div>

            <span
              title="Not linked yet"
              className="cursor-default text-sm font-medium text-faint"
            >
              Contact
            </span>
          </div>
        </div>
      )}
    </>
  )
}
