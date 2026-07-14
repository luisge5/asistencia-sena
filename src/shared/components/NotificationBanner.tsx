import { usePushNotifications } from '@/shared/hooks/usePushNotifications'

export function NotificationBanner() {
  const { isSupported, permission, isLoading, requestPermission } = usePushNotifications()

  if (!isSupported || permission === 'granted' || permission === 'denied') {
    return null
  }

  return (
    <div className="fixed bottom-20 left-4 right-4 z-40 max-w-[400px] mx-auto">
      <div className="bg-primary text-on-primary rounded-2xl p-4 shadow-lg">
        <div className="flex items-start gap-3">
          <div className="shrink-0 w-10 h-10 rounded-xl bg-on-primary/10 flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold">Notificaciones</div>
            <div className="text-xs text-on-primary/70 mt-0.5">
              Recibe alertas cuando se marque asistencia
            </div>
          </div>
        </div>
        <div className="flex gap-2 mt-3">
          <button
            onClick={requestPermission}
            disabled={isLoading}
            className="flex-1 h-9 rounded-xl bg-on-primary text-primary text-xs font-semibold active:scale-[0.98] transition-transform cursor-pointer disabled:opacity-50"
          >
            {isLoading ? 'Activando...' : 'Activar'}
          </button>
        </div>
      </div>
    </div>
  )
}
