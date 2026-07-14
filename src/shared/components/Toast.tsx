import { useState } from 'react'
import { useToastStore } from '@/shared/stores/toastStore'
import type { Toast as ToastItemData } from '@/shared/stores/toastStore'

export function ToastItem({ toast }: { toast: ToastItemData }) {
  const { removeToast } = useToastStore()
  const [isExiting, setIsExiting] = useState(false)

  const handleDismiss = () => {
    setIsExiting(true)
    setTimeout(() => removeToast(toast.id), 200)
  }

  return (
    <div
      className={`pointer-events-auto inline-flex items-center gap-3 px-4 py-2.5 rounded-xl bg-primary text-on-primary shadow-2xl text-sm font-medium transition-all duration-200 ${
        isExiting ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
      }`}
      role="alert"
    >
      <span>{toast.message}</span>
      {toast.action && (
        <button
          onClick={() => {
            toast.action?.onClick()
            handleDismiss()
          }}
          className="text-accent-soft font-semibold underline-offset-2 hover:underline cursor-pointer"
        >
          {toast.action.label}
        </button>
      )}
      <button
        onClick={handleDismiss}
        className="ml-1 text-on-primary/60 hover:text-on-primary transition-colors cursor-pointer"
        aria-label="Cerrar"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  )
}

export function ToastContainer() {
  const { toasts } = useToastStore()

  if (toasts.length === 0) return null

  return (
    <div className="absolute bottom-24 inset-x-0 z-40 pointer-events-none flex justify-center px-5" role="status" aria-live="polite" aria-label="Notificaciones">
      <div className="flex flex-col gap-2 items-center w-full max-w-sm">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} />
        ))}
      </div>
    </div>
  )
}
