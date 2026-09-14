export default function Footer() {
  return (
    <footer className="border-t border-line bg-surface-2">
      <div className="mx-auto max-w-7xl px-4 py-6 text-center text-xs text-faint sm:px-6 lg:px-8">
        &copy; {new Date().getFullYear()} KM Pay — personal practice project, not a live payment processor.
      </div>
    </footer>
  )
}
