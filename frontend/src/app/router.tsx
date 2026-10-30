import { createBrowserRouter } from 'react-router-dom'
import LandingPage from '../pages/LandingPage'
import PlaceholderPage from '../pages/PlaceholderPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '/login',
    element: <PlaceholderPage title="Login" />,
  },
  {
    path: '/register',
    element: <PlaceholderPage title="Create your account" />,
  },
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
    path: '*',
    element: <PlaceholderPage title="Page not found" />,
  },
])
