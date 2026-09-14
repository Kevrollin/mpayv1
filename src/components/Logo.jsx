export default function Logo({ size = 'md', showText = true, className = '' }) {
  const dims = {
    sm: { icon: 'h-8 w-8', text: 'text-lg' },
    md: { icon: 'h-10 w-10', text: 'text-xl' },
  }[size]

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <img
        src="/logo-mark.svg"
        alt={showText ? '' : 'KM Pay'}
        className={dims.icon}
        width={40}
        height={40}
      />
      {showText && (
        <span className={`${dims.text} font-bold tracking-tight text-ink`}>
          KM <span className="text-brand">Pay</span>
        </span>
      )}
    </div>
  )
}
