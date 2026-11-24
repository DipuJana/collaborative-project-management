import { useEffect, useState } from 'react'
import {
  Link,
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from 'react-router-dom'
import {
  Bell,
  LayoutDashboard,
  LogOut,
  Menu,
  Plus,
  Settings,
  User as UserIcon,
  X,
} from 'lucide-react'
import { ProjectFlowLogo } from '../components/logo'
import { Avatar } from '../components/ui/Avatar'
import { useAuth } from '../features/auth/useAuth'
import { getProjects } from '../features/projects/project.service'
import type { Project } from '../features/projects/project.types'
import { getUnreadNotificationCount } from '../features/notifications/notification.service'

const PROJECT_DOT_COLORS = [
  'bg-purple-500',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-indigo-500',
  'bg-rose-500',
  'bg-cyan-500',
]

export default function AppLayout() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const [projects, setProjects] = useState<Project[]>([])
  const [unreadCount, setUnreadCount] = useState<number>(0)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false)
    setUserMenuOpen(false)
  }, [location.pathname])

  // Fetch projects and notification count for the sidebar
  useEffect(() => {
    let mounted = true

    async function loadSidebarData() {
      try {
        const [projectsData, countData] = await Promise.allSettled([
          getProjects(),
          getUnreadNotificationCount(),
        ])

        if (!mounted) return

        if (projectsData.status === 'fulfilled') {
          setProjects(projectsData.value)
        }
        if (countData.status === 'fulfilled') {
          setUnreadCount(countData.value)
        }
      } catch {
        // Fallback silently if offline or network error
      }
    }

    loadSidebarData()

    // Poll notification count periodically (e.g. every 30 seconds)
    const interval = setInterval(async () => {
      try {
        const count = await getUnreadNotificationCount()
        if (mounted) setUnreadCount(count)
      } catch {
        // silent
      }
    }, 30000)

    return () => {
      mounted = false
      clearInterval(interval)
    }
  }, [location.pathname])

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  // Sidebar content component (reused in desktop and mobile drawer)
  const sidebarContent = (
    <div className="flex h-full flex-col justify-between bg-white text-slate-700">
      <div className="flex flex-col">
        {/* Brand / Logo */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-slate-100">
          <Link to="/dashboard" className="flex items-center gap-2">
            <ProjectFlowLogo size="md" />
          </Link>
          <button
            type="button"
            className="lg:hidden text-slate-400 hover:text-slate-600 p-1"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Primary Navigation Links */}
        <nav className="flex flex-col gap-1 px-3 pt-4">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              [
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-indigo-50 text-indigo-700 font-semibold'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
              ].join(' ')
            }
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/notifications"
            className={({ isActive }) =>
              [
                'flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-indigo-50 text-indigo-700 font-semibold'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
              ].join(' ')
            }
          >
            <div className="flex items-center gap-3">
              <Bell size={18} />
              <span>Notifications</span>
            </div>
            {unreadCount > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-100 px-1.5 text-xs font-bold text-rose-600">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </NavLink>
        </nav>

        {/* Projects Section */}
        <div className="mt-6 px-3">
          <div className="flex items-center justify-between px-3 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Projects
            </span>
            <Link
              to="/dashboard"
              title="Create or join project"
              className="text-slate-400 hover:text-indigo-600 p-0.5 rounded transition-colors"
            >
              <Plus size={14} />
            </Link>
          </div>

          <div className="flex flex-col gap-0.5 max-h-[40vh] overflow-y-auto pr-1">
            {projects.length === 0 ? (
              <p className="px-3 py-2 text-xs text-slate-400">
                No projects joined yet.
              </p>
            ) : (
              projects.map((project, idx) => {
                const isActive = location.pathname.startsWith(
                  `/projects/${project.id}`,
                )
                const dotColor =
                  PROJECT_DOT_COLORS[idx % PROJECT_DOT_COLORS.length]

                return (
                  <Link
                    key={project.id}
                    to={`/projects/${project.id}`}
                    className={[
                      'group flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors',
                      isActive
                        ? 'bg-indigo-50 text-indigo-700 font-medium'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
                    ].join(' ')}
                  >
                    <span
                      className={`h-2 w-2 rounded-full flex-shrink-0 ${dotColor}`}
                    />
                    <span className="truncate">{project.name}</span>
                  </Link>
                )
              })
            )}
          </div>
        </div>
      </div>

      {/* User Footer Profile & Settings */}
      <div className="border-t border-slate-100 p-3 relative">
        <div className="flex items-center justify-between rounded-xl p-2 hover:bg-slate-50 transition-colors">
          <Link
            to="/profile"
            className="flex items-center gap-2.5 min-w-0 flex-1"
          >
            <Avatar name={user?.name ?? 'User'} size="sm" />
            <div className="flex flex-col min-w-0">
              <span className="truncate text-xs font-semibold text-slate-800">
                {user?.name ?? 'Alex Jensen'}
              </span>
              <span className="truncate text-[11px] text-slate-400">
                {user?.email ?? 'user@projectflow.app'}
              </span>
            </div>
          </Link>

          <div className="relative">
            <button
              type="button"
              onClick={() => setUserMenuOpen((v) => !v)}
              className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              aria-label="User settings menu"
            >
              <Settings size={16} />
            </button>

            {/* User Quick Popover Menu */}
            {userMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setUserMenuOpen(false)}
                />
                <div className="absolute right-0 bottom-full mb-2 w-44 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg z-30">
                  <Link
                    to="/profile"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
                  >
                    <UserIcon size={14} />
                    <span>Profile & Account</span>
                  </Link>
                  <div className="my-1 border-t border-slate-100" />
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                  >
                    <LogOut size={14} />
                    <span>Log Out</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* ── Desktop Fixed Sidebar ─────────────────────────────────────────── */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col border-r border-slate-200/80 bg-white z-20">
        {sidebarContent}
      </aside>

      {/* ── Mobile Sidebar Drawer ─────────────────────────────────────────── */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          {/* Drawer Panel */}
          <div className="fixed inset-y-0 left-0 w-64 max-w-[80vw] bg-white shadow-xl">
            {sidebarContent}
          </div>
        </div>
      )}

      {/* ── Main Content Area ────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col lg:pl-64 min-w-0">
        {/* Top Navbar */}
        <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-slate-200/70 bg-white/80 px-4 backdrop-blur-md sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="lg:hidden p-1.5 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open sidebar"
            >
              <Menu size={20} />
            </button>
            <div className="lg:hidden">
              <ProjectFlowLogo size="sm" iconOnly />
            </div>
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/notifications"
              className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              aria-label="View notifications"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
              )}
            </Link>

            <Link
              to="/profile"
              className="flex items-center pl-1 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              title="User Profile"
            >
              <Avatar name={user?.name ?? 'User'} size="sm" />
            </Link>
          </div>
        </header>

        {/* Page Content Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
