import { Header } from './Header'
import { Navigation } from './Navigation'
import { OfflineBanner } from './OfflineBanner'
import { ToastContainer } from './Toast'
import { NotificationBanner } from './NotificationBanner'

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-on-primary focus:shadow-lg"
      >
        Saltar al contenido principal
      </a>

      <div className="app-frame bg-background relative flex flex-col w-full">
        <Header />
        <main id="main-content" className="flex-1 scroll-area overflow-y-auto safe-area-inset" tabIndex={-1}>
          {children}
        </main>
        <Navigation />
        <NotificationBanner />
        <ToastContainer />
        <OfflineBanner />
      </div>
    </div>
  )
}
