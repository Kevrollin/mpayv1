import { useState } from 'react'

const PROVIDERS = [
  {
    name: 'Google',
    icon: (
      <svg width="20" height="20" viewBox="0 0 48 48">
        <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l6-6C34.6 5.1 29.6 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21 21-9.4 21-21c0-1.2-.1-2.4-.4-3.5z" />
        <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 15.9 18.9 13 24 13c3.1 0 5.8 1.1 8 3l6-6C34.6 5.1 29.6 3 24 3 16 3 9 7.5 6.3 14.7z" />
        <path fill="#4CAF50" d="M24 45c5.5 0 10.4-2.1 14.1-5.5l-6.5-5.3C29.6 35.9 27 37 24 37c-5.3 0-9.7-3.4-11.3-8.1l-6.6 5.1C9 40.5 16 45 24 45z" />
        <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4 5.4l6.5 5.3C41.4 35.6 45 30.4 45 24c0-1.2-.1-2.4-.4-3.5z" />
      </svg>
    ),
  },
  {
    name: 'Facebook',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="12" fill="#1877F2" />
        <path
          fill="#fff"
          d="M15.1 12.7h-2v7h-2.9v-7H8.6v-2.5h1.6V8.5c0-1.6.9-2.9 3.2-2.9h2v2.5h-1.4c-.6 0-.7.3-.7.7v1.4h2.1z"
        />
      </svg>
    ),
  },
  {
    name: 'Apple',
    icon: (
      <svg width="18" height="18" viewBox="0 0 384 512" fill="#000">
        <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141 0 184.8 0 273.5c0 26.2 4.8 53.3 14.4 81.2 12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-57.7-90-57.7-91.9zM256.4 88.9c27.3-32.4 24.8-61.9 24-72.9-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-33.9z" />
      </svg>
    ),
  },
]

export default function SocialAuthRow() {
  const [notice, setNotice] = useState(null)

  return (
    <div className="mt-6">
      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-line" />
        <span className="text-xs font-medium uppercase tracking-wide text-faint">Or</span>
        <span className="h-px flex-1 bg-line" />
      </div>

      <div className="mt-5 flex justify-center gap-4">
        {PROVIDERS.map((p) => (
          <button
            key={p.name}
            type="button"
            onClick={() => setNotice(`${p.name} sign-in isn't connected in this build.`)}
            aria-label={`Continue with ${p.name}`}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow transition hover:scale-105"
          >
            {p.icon}
          </button>
        ))}
      </div>

      {notice && <p className="mt-3 text-center text-xs text-faint">{notice}</p>}
    </div>
  )
}
