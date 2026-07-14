import { createBrowserRouter, Navigate } from 'react-router-dom'
import { MainLayout } from '@/shared/components/MainLayout'
import { ProtectedRoute } from '@/shared/components/ProtectedRoute'
import { LoginPage } from '@/features/auth/pages/LoginPage'
import { MiCarnetPage } from '@/features/aprendices/pages/MiCarnetPage'
import { LogoutPage } from '@/features/auth/pages/LogoutPage'
import { DashboardPage } from '@/features/hoy/pages/DashboardPage'
import { AprendicesPage } from '@/features/aprendices/pages/AprendicesPage'
import { ImportPage } from '@/features/aprendices/pages/ImportPage'
import { CarnetsPage } from '@/features/aprendices/pages/CarnetsPage'
import { ScanPage } from '@/features/scan/pages/ScanPage'
import { HistorialPage } from '@/features/historial/pages/HistorialPage'

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/mi-carnet',
    element: <MiCarnetPage />,
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
    path: '/aprendices/carnets',
    element: (
      <ProtectedRoute>
        <MainLayout>
          <CarnetsPage />
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
    element: <Navigate to="/historial" replace />,
  },
])
