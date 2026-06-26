import { useOffline } from '../hooks/useOffline'

export function OfflineBanner() {
  const { isOnline, pendingCount } = useOffline()

  if (isOnline && pendingCount === 0) {
    return null
  }

  if (!isOnline) {
    return (
      <div
        className="fixed bottom-0 left-0 right-0 z-50 border-t-3 border-orange-500 bg-orange-500 p-3 text-center text-sm font-bold text-white shadow-lg"
        style={{ borderWidth: '3px' }}
        role="alert"
      >
        <div className="flex items-center justify-center gap-2">
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="1" y1="1" x2="23" y2="23" />
            <path d="M16.72 11.06A10.94 10.94 0 0119 12.55" />
            <path d="M5 12.55a10.94 10.94 0 015.17-2.39" />
            <path d="M10.71 5.05A16 16 0 0122.56 9" />
            <path d="M1.42 9a15.91 15.91 0 014.7-2.88" />
            <path d="M8.53 16.11a6 6 0 016.95 0" />
            <line x1="12" y1="20" x2="12.01" y2="20" />
          </svg>
          <span>Sin conexión - Los cambios se sincronizarán automáticamente</span>
        </div>
      </div>
    )
  }

  if (pendingCount > 0) {
    return (
      <div
        className="fixed bottom-0 left-0 right-0 z-50 border-t-3 border-yellow-500 bg-yellow-500 p-3 text-center text-sm font-bold text-white shadow-lg"
        style={{ borderWidth: '3px' }}
        role="alert"
      >
        <div className="flex items-center justify-center gap-2">
          <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 12a9 9 0 11-6.219-8.56" />
          </svg>
          <span>{pendingCount} cambio{pendingCount !== 1 ? 's' : ''} pendiente{pendingCount !== 1 ? 's' : ''} por sincronizar</span>
        </div>
      </div>
    )
  }

  return null
}