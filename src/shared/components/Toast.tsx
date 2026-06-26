import { useState } from 'react'
import { useToastStore } from '@/shared/stores/toastStore'
import type { Toast as ToastItemData } from '@/shared/stores/toastStore'

const icons = {
  success: (
    <svg className="h-5 w-5 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M8 12l3 3 5-5" />
    </svg>
  ),
  error: (
    <svg className="h-5 w-5 text-red-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M15 9l-6 6M9 9l6 6" />
    </svg>
  ),
  info: (
    <svg className="h-5 w-5 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  ),
  warning: (
    <svg className="h-5 w-5 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  ),
}

const typeStyles: Record<ToastItemData['type'], { bg: string; border: string }> = {
  success: { bg: 'bg-green-50', border: 'border-green-400' },
  error: { bg: 'bg-red-50', border: 'border-red-400' },
  info: { bg: 'bg-blue-50', border: 'border-blue-400' },
  warning: { bg: 'bg-amber-50', border: 'border-amber-400' },
}

export function ToastItem({ toast }: { toast: ToastItemData }) {
  const { removeToast } = useToastStore()
  const [isExiting, setIsExiting] = useState(false)

  const style = typeStyles[toast.type]

  const handleDismiss = () => {
    setIsExiting(true)
    setTimeout(() => removeToast(toast.id), 200)
  }

  return (
    <div
      className={`${style.bg} ${style.border} flex items-start gap-3 rounded-xl border-3 px-4 py-3 shadow-lg transition-all duration-200 ${
        isExiting ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'
      }`}
      style={{
        boxShadow: 'inset -2px -2px 6px rgba(0,0,0,0.06), 4px 4px 12px rgba(0,0,0,0.12)',
      }}
    >
      <span className="mt-0.5 flex-shrink-0">{icons[toast.type]}</span>

      <p className="flex-1 text-sm font-medium text-gray-800">{toast.message}</p>

      {toast.action && (
        <button
          onClick={() => {
            toast.action?.onClick()
            handleDismiss()
          }}
          className="cursor-pointer rounded-lg bg-gray-800 px-3 py-1 text-xs font-bold text-white transition-colors hover:bg-gray-700 active:scale-95"
        >
          {toast.action.label}
        </button>
      )}

      <button
        onClick={handleDismiss}
        className="cursor-pointer text-gray-400 transition-colors hover:text-gray-600"
        aria-label="Cerrar"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}

export function ToastContainer() {
  const { toasts } = useToastStore()

  if (toasts.length === 0) return null

  return (
    <div className="pointer-events-none fixed bottom-24 right-0 left-0 z-50 mx-auto flex max-w-md flex-col gap-2 px-4" role="status" aria-live="polite" aria-label="Notificaciones">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto w-full">
          <ToastItem toast={toast} />
        </div>
      ))}
    </div>
  )
}
