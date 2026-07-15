import { useState, useEffect, useCallback, useRef } from 'react'

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

function loadQueueFromStorage(): OfflineQueueItem[] {
  try {
    const saved = localStorage.getItem(QUEUE_KEY)
    return saved ? JSON.parse(saved) : []
  } catch {
    localStorage.removeItem(QUEUE_KEY)
    return []
  }
}

export function useOffline(): UseOfflineResult {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [queue, setQueue] = useState<OfflineQueueItem[]>(loadQueueFromStorage)
  const queueRef = useRef(queue)

  useEffect(() => {
    queueRef.current = queue
  }, [queue])

  useEffect(() => {
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

  const processQueue = useCallback(async () => {
    const currentQueue = queueRef.current
    if (currentQueue.length === 0) return

    const itemsToProcess = [...currentQueue]
    setQueue([])

    for (const item of itemsToProcess) {
      try {
        console.log('Processing offline item:', item)
      } catch (error) {
        console.error('Error processing offline item:', error)
        setQueue(prev => [...prev, item])
      }
    }
  }, [])

  useEffect(() => {
    if (isOnline && queue.length > 0) {
      void processQueue()
    }
  }, [isOnline, queue.length, processQueue])

  const addToQueue = useCallback((item: Omit<OfflineQueueItem, 'id' | 'timestamp'>) => {
    const newItem: OfflineQueueItem = {
      ...item,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    }
    setQueue(prev => [...prev, newItem])
  }, [])

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
