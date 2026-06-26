import { useState, useEffect, useCallback } from 'react'

interface OfflineQueueItem {
  id: string
  timestamp: number
  action: string
  data: Record<string, unknown>
}

interface UseOfflineResult {
  isOnline: boolean
  pendingCount: number
  addToQueue: (item: Omit<OfflineQueueItem, 'id' | 'timestamp'>) => void
  processQueue: () => Promise<void>
  clearQueue: () => void
}

const QUEUE_KEY = 'asistencia_offline_queue'

export function useOffline(): UseOfflineResult {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [queue, setQueue] = useState<OfflineQueueItem[]>([])

  useEffect(() => {
    const savedQueue = localStorage.getItem(QUEUE_KEY)
    if (savedQueue) {
      try {
        setQueue(JSON.parse(savedQueue))
      } catch {
        localStorage.removeItem(QUEUE_KEY)
      }
    }

    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue))
  }, [queue])

  useEffect(() => {
    if (isOnline && queue.length > 0) {
      processQueue()
    }
  }, [isOnline])

  const addToQueue = useCallback((item: Omit<OfflineQueueItem, 'id' | 'timestamp'>) => {
    const newItem: OfflineQueueItem = {
      ...item,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    }
    setQueue(prev => [...prev, newItem])
  }, [])

  const processQueue = useCallback(async () => {
    if (queue.length === 0) return

    const itemsToProcess = [...queue]
    setQueue([])

    for (const item of itemsToProcess) {
      try {
        console.log('Processing offline item:', item)
      } catch (error) {
        console.error('Error processing offline item:', error)
        setQueue(prev => [...prev, item])
      }
    }
  }, [queue])

  const clearQueue = useCallback(() => {
    setQueue([])
    localStorage.removeItem(QUEUE_KEY)
  }, [])

  return {
    isOnline,
    pendingCount: queue.length,
    addToQueue,
    processQueue,
    clearQueue,
  }
}