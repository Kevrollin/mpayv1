import { useLocation } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'

const BARE_ROUTES = ['/login', '/signup']

function isBareRoute(pathname) {
  return BARE_ROUTES.includes(pathname) || pathname.startsWith('/track')
}

export default function Layout({ children }) {
  const location = useLocation()

  if (isBareRoute(location.pathname)) {
    return <div className="min-h-screen bg-app">{children}</div>
  }

  return (
    <div className="flex min-h-screen flex-col bg-app">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
