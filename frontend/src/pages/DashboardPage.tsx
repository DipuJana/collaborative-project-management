import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowDown,
  AlertCircle,
  CheckCircle2,
  FolderKanban,
  Minus,
  Plus,
  Users,
  ClipboardList,
  FolderOpen,
  Globe,
  Smartphone,
  Laptop,
} from 'lucide-react'
import { useAuth } from '../features/auth/useAuth'
import { getProjects } from '../features/projects/project.service'
import type { Project } from '../features/projects/project.types'
import { getProjectTasks } from '../features/tasks/task.service'
import type { Task, TaskPriority } from '../features/tasks/task.types'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { StatusBadge, RoleBadge } from '../components/ui/Badge'
import { ProgressBar } from '../components/ui/ProgressBar'
import { AvatarGroup } from '../components/ui/Avatar'
import { SkeletonCard } from '../components/ui/Skeleton'
import { CreateProjectModal } from '../features/projects/CreateProjectModal'
import { JoinProjectModal } from '../features/projects/JoinProjectModal'

// Visual icon choices for project cards
const PROJECT_ICONS = [Laptop, Smartphone, Globe, FolderKanban]
const PROGRESS_COLORS: Array<'purple' | 'green' | 'orange' | 'indigo'> = [
  'purple',
  'green',
  'orange',
  'indigo',
]

export default function DashboardPage() {
  const { user } = useAuth()

  const [projects, setProjects] = useState<Project[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [joinModalOpen, setJoinModalOpen] = useState(false)

  // Dynamic greeting based on time of day
  const greeting = useMemo(() => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }, [])

  const firstName = user?.name ? user.name.split(' ')[0] : 'there'

  // Load projects and associated tasks
  async function loadDashboardData() {
    try {
      setLoading(true)
      const projectList = await getProjects()
      setProjects(projectList)

      // Fetch tasks for each project in parallel
      const tasksPromises = projectList.map(async (project) => {
        try {
          const res = await getProjectTasks(project.id, { limit: 50 })
          return res.tasks.map((t) => ({
            ...t,
            projectName: project.name,
          }))
        } catch {
          return []
        }
      })

      const tasksByProject = await Promise.all(tasksPromises)
      const allTasks = tasksByProject.flat()
      setTasks(allTasks)
    } catch {
      // Silently fall back to empty state if server is offline
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboardData()
  }, [])

  // Derived metrics
  const myProjects = useMemo(
    () => projects.filter((p) => p.role === 'OWNER'),
    [projects],
  )

  const joinedProjects = useMemo(
    () => projects.filter((p) => p.role !== 'OWNER'),
    [projects],
  )

  const myAssignedTasks = useMemo(() => {
    if (!user) return tasks
    // Filter tasks assigned to current user, or if unassigned return recent tasks
    const assigned = tasks.filter((t) => t.assignedTo === user.id)
    return assigned.length > 0 ? assigned : tasks.slice(0, 5)
  }, [tasks, user])

  const openTasksCount = useMemo(
    () => tasks.filter((t) => t.status !== 'DONE').length,
    [tasks],
  )

  const completedTasksCount = useMemo(
    () => tasks.filter((t) => t.status === 'DONE').length,
    [tasks],
  )

  // Compute progress for each project
  function getProjectProgress(projectId: string) {
    const projectTasks = tasks.filter((t) => t.projectId === projectId)
    if (projectTasks.length === 0) return 0
    const done = projectTasks.filter((t) => t.status === 'DONE').length
    return Math.round((done / projectTasks.length) * 100)
  }

  function formatPriority(priority: TaskPriority) {
    if (priority === 'HIGH') {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600">
          <AlertCircle size={14} />
          High
        </span>
      )
    }
    if (priority === 'MEDIUM') {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-orange-600">
          <Minus size={14} />
          Medium
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
        <ArrowDown size={14} />
        Low
      </span>
    )
  }

  function formatDueDate(dueDate: string | null) {
    if (!dueDate) return 'No due date'
    try {
      const date = new Date(dueDate)
      const today = new Date()
      if (
        date.getFullYear() === today.getFullYear() &&
        date.getMonth() === today.getMonth() &&
        date.getDate() === today.getDate()
      ) {
        return 'Today'
      }
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
    } catch {
      return dueDate
    }
  }

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto">
      {/* ── Top Header Section ────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            {greeting}, {firstName}.
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Keep your projects moving forward today.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="md"
            onClick={() => setJoinModalOpen(true)}
            className="border-slate-300 font-semibold"
          >
            Join Project
          </Button>

          <Button
            variant="primary"
            size="md"
            leftIcon={<Plus size={16} />}
            onClick={() => setCreateModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 font-semibold shadow-sm"
          >
            Create Project
          </Button>
        </div>
      </div>

      {/* ── 4 KPI Summary Cards ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* KPI 1: My Projects */}
        <Card className="flex items-center gap-4 p-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
            <FolderKanban size={24} />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">My Projects</p>
            <p className="text-2xl font-bold text-slate-900">
              {loading ? '-' : myProjects.length}
            </p>
          </div>
        </Card>

        {/* KPI 2: Joined Projects */}
        <Card className="flex items-center gap-4 p-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
            <Users size={24} />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Joined Projects</p>
            <p className="text-2xl font-bold text-slate-900">
              {loading ? '-' : joinedProjects.length}
            </p>
          </div>
        </Card>

        {/* KPI 3: Open Tasks */}
        <Card className="flex items-center gap-4 p-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
            <ClipboardList size={24} />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">My Open Tasks</p>
            <p className="text-2xl font-bold text-slate-900">
              {loading ? '-' : openTasksCount}
            </p>
          </div>
        </Card>

        {/* KPI 4: Completed Tasks */}
        <Card className="flex items-center gap-4 p-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Completed Tasks</p>
            <p className="text-2xl font-bold text-slate-900">
              {loading ? '-' : completedTasksCount}
            </p>
          </div>
        </Card>
      </div>

      {/* ── My Projects Section ───────────────────────────────────────────── */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">My Projects</h2>
            <p className="text-xs text-slate-500">Projects you own.</p>
          </div>
          {myProjects.length > 3 && (
            <span className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 cursor-pointer">
              View all
            </span>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : myProjects.length === 0 ? (
          <Card className="p-8 text-center flex flex-col items-center justify-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <FolderOpen size={24} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">
                No owned projects yet
              </p>
              <p className="text-xs text-slate-500 max-w-sm mt-1">
                Create your first project to start organizing tasks, inviting
                teammates, and tracking progress.
              </p>
            </div>
            <Button
              size="sm"
              variant="primary"
              onClick={() => setCreateModalOpen(true)}
              className="mt-2 bg-indigo-600 hover:bg-indigo-700"
            >
              + Create Project
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {myProjects.map((project, idx) => {
              const Icon = PROJECT_ICONS[idx % PROJECT_ICONS.length]
              const progress = getProjectProgress(project.id)
              const color = PROGRESS_COLORS[idx % PROGRESS_COLORS.length]

              return (
                <Link
                  key={project.id}
                  to={`/projects/${project.id}`}
                  className="group block"
                >
                  <Card className="p-5 h-full flex flex-col justify-between transition-all duration-150 hover:shadow-md hover:border-slate-300">
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                          <Icon size={20} />
                        </div>
                        <span className="text-xs font-semibold text-slate-400">
                          {progress}%
                        </span>
                      </div>

                      <div>
                        <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                          {project.name}
                        </h3>
                        <p className="mt-1 text-xs text-slate-500 line-clamp-2">
                          {project.description ||
                            'No description provided for this project.'}
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <AvatarGroup
                          names={[
                            user?.name ?? 'Alex',
                            'Sarah Jenkins',
                            'Marcus Chen',
                          ]}
                          max={3}
                          size="xs"
                        />
                        <span className="text-[11px] font-medium text-slate-400">
                          Progress
                        </span>
                      </div>
                      <ProgressBar
                        value={progress}
                        colour={color}
                        size="sm"
                      />
                    </div>
                  </Card>
                </Link>
              )
            })}
          </div>
        )}
      </section>

      {/* ── Joined Projects Section ──────────────────────────────────────── */}
      <section className="flex flex-col gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Joined Projects</h2>
          <p className="text-xs text-slate-500">
            Projects you're a member of.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : joinedProjects.length === 0 ? (
          <Card className="p-6 text-center text-xs text-slate-500">
            You haven't joined any shared team projects yet. Click{' '}
            <strong
              onClick={() => setJoinModalOpen(true)}
              className="text-indigo-600 cursor-pointer font-semibold underline"
            >
              Join Project
            </strong>{' '}
            to request access with a code.
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {joinedProjects.map((project) => {
              const progress = getProjectProgress(project.id)

              return (
                <Link
                  key={project.id}
                  to={`/projects/${project.id}`}
                  className="group block"
                >
                  <Card className="p-5 h-full flex flex-col justify-between transition-all duration-150 hover:shadow-md hover:border-slate-300">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                          {project.name}
                        </h3>
                        <RoleBadge role={project.role} />
                      </div>
                      <p className="mt-1 text-xs text-slate-400">
                        Code: {project.code.slice(0, 8)}...
                      </p>
                    </div>

                    <div className="mt-6 flex flex-col gap-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">Task Progress</span>
                        <span className="font-semibold text-slate-700">
                          {progress}%
                        </span>
                      </div>
                      <ProgressBar
                        value={progress}
                        colour="green"
                        size="sm"
                      />
                    </div>
                  </Card>
                </Link>
              )
            })}
          </div>
        )}
      </section>

      {/* ── My Tasks Section ─────────────────────────────────────────────── */}
      <section className="flex flex-col gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">My Tasks</h2>
          <p className="text-xs text-slate-500">
            Tasks assigned to you across your projects.
          </p>
        </div>

        <Card padding={false} className="overflow-hidden">
          {loading ? (
            <div className="p-6">
              <SkeletonCard />
            </div>
          ) : myAssignedTasks.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500">
              No tasks assigned yet. You're all caught up!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-3 px-5">Task Title</th>
                    <th className="py-3 px-5">Project</th>
                    <th className="py-3 px-5">Status</th>
                    <th className="py-3 px-5">Priority</th>
                    <th className="py-3 px-5">Due Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {myAssignedTasks.map((task) => (
                    <tr
                      key={task.id}
                      className="hover:bg-slate-50/60 transition-colors"
                    >
                      <td className="py-3.5 px-5 font-semibold text-slate-800">
                        {task.title}
                      </td>
                      <td className="py-3.5 px-5 text-slate-500 text-xs">
                        {task.projectName || 'Project Workspace'}
                      </td>
                      <td className="py-3.5 px-5">
                        <StatusBadge status={task.status} />
                      </td>
                      <td className="py-3.5 px-5">
                        {formatPriority(task.priority)}
                      </td>
                      <td className="py-3.5 px-5 text-xs text-slate-500">
                        {formatDueDate(task.dueDate)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </section>

      {/* ── Modals ───────────────────────────────────────────────────────── */}
      <CreateProjectModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={() => {
          setCreateModalOpen(false)
          loadDashboardData()
        }}
      />

      <JoinProjectModal
        open={joinModalOpen}
        onClose={() => setJoinModalOpen(false)}
        onSuccess={() => {
          setJoinModalOpen(false)
          loadDashboardData()
        }}
      />
    </div>
  )
}
