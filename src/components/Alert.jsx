const variants = {
  error: 'border-danger-line/40 bg-danger-soft/10 text-danger-text',
  success: 'border-success-line/40 bg-success-soft/10 text-success-text',
  info: 'border-info-line/40 bg-info-soft/10 text-info-text',
  warning: 'border-warning-line/40 bg-warning-soft/10 text-warning-text',
}

export default function Alert({ variant = 'info', title, children, className = '' }) {
  return (
    <div role="alert" className={`rounded-lg border px-4 py-3 text-sm ${variants[variant]} ${className}`}>
      {title && <p className="font-semibold">{title}</p>}
      {children && <div className="mt-0.5">{children}</div>}
    </div>
  )
}
