import { Header } from './Header'
import { Navigation } from './Navigation'
import { OfflineBanner } from './OfflineBanner'
import { ToastContainer } from './Toast'

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:rounded-xl focus:bg-[var(--color-primary)] focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-white focus:shadow-lg"
      >
        Saltar al contenido principal
      </a>

      <Header />
      <Navigation />
      <main id="main-content" className="container mx-auto px-4 py-6" tabIndex={-1}>
        {children}
      </main>
      <OfflineBanner />
      <ToastContainer />
    </div>
  )
}
