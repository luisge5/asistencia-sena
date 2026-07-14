import { useEffect, useCallback, useRef } from 'react'
import { insforge } from '@/lib/insforge'
import type { Asistencia } from '@/types'

export interface RealtimePayload {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE'
  new: Asistencia | null
  old: Asistencia | null
}

export function useRealtimeAsistencias(
  ficha: number,
  callback: (payload: RealtimePayload) => void
) {
  const callbackRef = useRef(callback)
  callbackRef.current = callback

  const channelName = `asistencias:ficha:${ficha}`

  const handlePayload = useCallback((payload: RealtimePayload) => {
    callbackRef.current(payload)
  }, [])

  useEffect(() => {
    if (!ficha) return

    let mounted = true

    const setup = async () => {
      try {
        await insforge.realtime.connect()

        const response = await insforge.realtime.subscribe(channelName)

        if (!response.ok) {
          console.error('Realtime subscription failed:', response.error)
          return
        }

        insforge.realtime.on('postgres_changes', (payload: unknown) => {
          if (!mounted) return
          const typedPayload = payload as {
            eventType: 'INSERT' | 'UPDATE' | 'DELETE'
            new: Asistencia | null
            old: Asistencia | null
          }
          handlePayload(typedPayload)
        })
      } catch (error) {
        console.error('Realtime setup error:', error)
      }
    }

    setup()

    return () => {
      mounted = false
      insforge.realtime.unsubscribe(channelName)
    }
  }, [ficha, channelName, handlePayload])
}

export function useRealtimeAprendices(
  ficha: number,
  callback: () => void
) {
  const callbackRef = useRef(callback)
  callbackRef.current = callback

  const channelName = `aprendices:ficha:${ficha}`

  const handlePayload = useCallback(() => {
    callbackRef.current()
  }, [])

  useEffect(() => {
    if (!ficha) return

    let mounted = true

    const setup = async () => {
      try {
        await insforge.realtime.connect()

        const response = await insforge.realtime.subscribe(channelName)

        if (!response.ok) {
          console.error('Realtime subscription failed:', response.error)
          return
        }

        insforge.realtime.on('postgres_changes', () => {
          if (!mounted) return
          handlePayload()
        })
      } catch (error) {
        console.error('Realtime setup error:', error)
      }
    }

    setup()

    return () => {
      mounted = false
      insforge.realtime.unsubscribe(channelName)
    }
  }, [ficha, channelName, handlePayload])
}
