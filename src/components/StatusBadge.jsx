const styles = {
  pending: 'bg-warning-soft/10 text-warning-text border-warning-line/30',
  completed: 'bg-success-soft/10 text-success-text border-success-line/30',
  failed: 'bg-danger-soft/10 text-danger-text border-danger-line/30',
  canceled: 'bg-neutral-soft/10 text-neutral-text border-neutral-line/30',
}

const labels = {
  pending: 'Pending',
  completed: 'Completed',
  failed: 'Failed',
  canceled: 'Canceled',
}

export default function StatusBadge({ status }) {
  const style = styles[status] || styles.pending
  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${style}`}>
      {labels[status] || status}
    </span>
  )
}
