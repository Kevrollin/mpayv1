import { useTheme } from '../context/ThemeContext'

// Four pre-made SVG files in public/ — one per (icon-only vs full lockup) x
// (light vs dark) combination. We just pick the right file and drop it in
// an <img> tag; no SVG markup lives in this component.
const SOURCES = {
  icon: { dark: '/download.svg', light: '/download (1).svg' },
  full: { dark: '/logo-full-dark.svg', light: '/logo-full-light.svg' },
}

export default function Logo({ size = 'md', showText = true, className = '' }) {
  const { theme } = useTheme()
  const isLight = theme === 'light'
  const variant = showText ? 'full' : 'icon'
  const src = SOURCES[variant][isLight ? 'light' : 'dark']

  const heightClass = { sm: 'h-[38px]', md: 'h-12', compact: 'h-[43px]' }[size]

  return (
    <div className={`flex items-center ${className}`}>
      <img src={src} alt="KM Pay" className={`${heightClass} w-auto`} />
    </div>
  )
}
