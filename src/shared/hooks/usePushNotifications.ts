import { useState, useEffect, useCallback } from 'react'
import { insforge } from '@/lib/insforge'
import { useAuthStore } from '@/stores/authStore'

interface NotificationState {
  isSupported: boolean
  permission: NotificationPermission
  isLoading: boolean
  error: string | null
}

export function usePushNotifications() {
  const [state, setState] = useState<NotificationState>({
    isSupported: false,
    permission: 'default',
    isLoading: false,
    error: null,
  })

  const user = useAuthStore((state) => state.user)

  useEffect(() => {
    const isSupported = 'Notification' in window
    setState((prev) => ({
      ...prev,
      isSupported,
      permission: isSupported ? Notification.permission : 'denied',
    }))
  }, [])

  const requestPermission = useCallback(async () => {
    if (!state.isSupported) {
      setState((prev) => ({ ...prev, error: 'Notifications not supported' }))
      return false
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }))

    try {
      const permission = await Notification.requestPermission()
      setState((prev) => ({ ...prev, permission, isLoading: false }))
      return permission === 'granted'
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to request permission',
      }))
      return false
    }
  }, [state.isSupported])

  const showNotification = useCallback((title: string, body: string, url?: string) => {
    if (state.permission !== 'granted') return

    try {
      const notification = new Notification(title, {
        body,
        icon: '/pwa-192x192.png',
        badge: '/pwa-192x192.png',
        tag: 'asistencia-notification',
      })

      notification.onclick = () => {
        window.focus()
        if (url) {
          window.location.href = url
        }
        notification.close()
      }
    } catch (error) {
      console.error('Failed to show notification:', error)
    }
  }, [state.permission])

  const sendNotification = useCallback(async (title: string, body: string, targetUserId?: string) => {
    try {
      const { error } = await insforge.functions.invoke('send-push-notification', {
        body: {
          title,
          body,
          target_user_id: targetUserId,
          ficha: user?.ficha_asignada,
        },
      })

      if (error) {
        console.error('Failed to send notification:', error)
        return false
      }

      showNotification(title, body)
      return true
    } catch (error) {
      console.error('Failed to send notification:', error)
      return false
    }
  }, [user?.ficha_asignada, showNotification])

  return {
    ...state,
    requestPermission,
    showNotification,
    sendNotification,
  }
}
