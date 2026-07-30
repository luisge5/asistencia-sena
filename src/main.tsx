import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { router } from './routes'
import { queryClient } from './lib/query'
import './index.css'

const originalConsoleError = console.error
console.error = (...args: unknown[]) => {
  const msg = String(args[0] ?? '')
  if (msg.includes('auth/refresh') || msg.includes('Realtime setup error') || msg.includes('send-push-notification') || msg.includes('Failed to send notification')) return
  originalConsoleError(...args)
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
)
