import { createBrowserRouter } from 'react-router-dom'
import LandingPage from '../pages/LandingPage'
import LoginPage from '../pages/LoginPage'
import RegisterPage from '../pages/RegisterPage'
import PlaceholderPage from '../pages/PlaceholderPage'
import { ProtectedRoute } from './ProtectedRoute'
import { PublicOnlyRoute } from './PublicOnlyRoute'
import AppLayout from '../layouts/AppLayout'

export const router = createBrowserRouter([
  // ── Public landing ────────────────────────────────────────────────────────
  {
    path: '/',
    element: <LandingPage />,
  },

  // ── Public-only (redirect to /dashboard if already logged in) ────────────
  {
    element: <PublicOnlyRoute />,
    children: [
      {
        path: '/login',
        element: <LoginPage />,
      },
      {
        path: '/register',
        element: <RegisterPage />,
      },
    ],
  },

  // ── Protected (redirect to /login if not authenticated) ──────────────────
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          {
            path: '/dashboard',
            element: <PlaceholderPage title="Dashboard" />,
          },
          {
            path: '/notifications',
            element: <PlaceholderPage title="Notifications" />,
          },
          {
            path: '/profile',
            element: <PlaceholderPage title="Your profile" />,
          },
          {
            path: '/projects/:projectId',
            element: <PlaceholderPage title="Project workspace" />,
          },
          {
            path: '/projects/:projectId/tasks',
            element: <PlaceholderPage title="Project tasks" />,
          },
          {
            path: '/projects/:projectId/members',
            element: <PlaceholderPage title="Project members" />,
          },
          {
            path: '/projects/:projectId/settings',
            element: <PlaceholderPage title="Project settings" />,
          },
        ],
      },
    ],
  },

  // ── 404 ──────────────────────────────────────────────────────────────────
  {
    path: '*',
    element: <PlaceholderPage title="Page not found" />,
  },
])
