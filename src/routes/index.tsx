import { createBrowserRouter } from 'react-router-dom'
import { MainLayout } from '@/shared/components/MainLayout'
import { ProtectedRoute } from '@/shared/components/ProtectedRoute'
import { LoginPage } from '@/features/auth/pages/LoginPage'
import { LogoutPage } from '@/features/auth/pages/LogoutPage'
import { DashboardPage } from '@/features/hoy/pages/DashboardPage'
import { AprendicesPage } from '@/features/aprendices/pages/AprendicesPage'
import { ImportPage } from '@/features/aprendices/pages/ImportPage'
import { ScanPage } from '@/features/scan/pages/ScanPage'
import { HistorialPage } from '@/features/historial/pages/HistorialPage'
import { EstadisticasPage } from '@/features/estadisticas/pages/EstadisticasPage'

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/logout',
    element: <LogoutPage />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <MainLayout>
          <DashboardPage />
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/scan',
    element: (
      <ProtectedRoute>
        <MainLayout>
          <ScanPage />
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/aprendices',
    element: (
      <ProtectedRoute>
        <MainLayout>
          <AprendicesPage />
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/aprendices/importar',
    element: (
      <ProtectedRoute>
        <MainLayout>
          <ImportPage />
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/historial',
    element: (
      <ProtectedRoute>
        <MainLayout>
          <HistorialPage />
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/estadisticas',
    element: (
      <ProtectedRoute>
        <MainLayout>
          <EstadisticasPage />
        </MainLayout>
      </ProtectedRoute>
    ),
  },
])
