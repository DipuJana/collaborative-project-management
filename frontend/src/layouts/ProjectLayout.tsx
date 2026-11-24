import { useCallback, useEffect, useState } from 'react'
import {
  Link,
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom'
import {
  Check,
  ChevronRight,
  Copy,
  LayoutDashboard,
  Kanban,
  Settings,
  Users,
  AlertCircle,
  ArrowLeft,
} from 'lucide-react'
import { getProjectById } from '../features/projects/project.service'
import type { Project } from '../features/projects/project.types'
import { getProjectMembers } from '../features/members/member.service'
import type { ProjectMember } from '../features/members/member.types'
import { getProjectTasks } from '../features/tasks/task.service'
import type { Task } from '../features/tasks/task.types'
import { RoleBadge } from '../components/ui/Badge'
import { ProgressBar } from '../components/ui/ProgressBar'
import { AvatarGroup } from '../components/ui/Avatar'
import { Button } from '../components/ui/Button'
import { Skeleton, SkeletonCard } from '../components/ui/Skeleton'

export type ProjectContextType = {
  project: Project | null
  members: ProjectMember[]
  tasks: Task[]
  loading: boolean
  error: string | null
  reload: () => Promise<void>
}

export default function ProjectLayout() {
  const { projectId } = useParams<{ projectId: string }>()
  const location = useLocation()
  const navigate = useNavigate()

  const [project, setProject] = useState<Project | null>(null)
  const [members, setMembers] = useState<ProjectMember[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copiedCode, setCopiedCode] = useState(false)

  const loadProjectData = useCallback(async () => {
    if (!projectId) return

    try {
      setLoading(true)
      setError(null)

      const [projData, membersData, tasksData] = await Promise.all([
        getProjectById(projectId),
        getProjectMembers(projectId).catch(() => []),
        getProjectTasks(projectId, { limit: 100 }).catch(() => ({
          tasks: [],
          pagination: { page: 1, limit: 100, total: 0, totalPages: 0 },
        })),
      ])

      setProject(projData)
      setMembers(membersData)
      setTasks(tasksData.tasks)
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Unable to load project details.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    loadProjectData()
  }, [loadProjectData])

  function handleCopyCode() {
    if (!project?.code) return
    navigator.clipboard.writeText(project.code)
    setCopiedCode(true)
    setTimeout(() => setCopiedCode(false), 2000)
  }

  // Calculate task completion progress
  const progress =
    tasks.length === 0
      ? 0
      : Math.round(
          (tasks.filter((t) => t.status === 'DONE').length / tasks.length) * 100,
        )

  if (loading && !project) {
    return (
      <div className="flex flex-col gap-6 max-w-7xl mx-auto">
        <Skeleton className="h-4 w-48" />
        <SkeletonCard />
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center max-w-md mx-auto gap-4">
        <div className="h-12 w-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
          <AlertCircle size={24} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-800">
            {error || 'Project Not Found'}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            You might not have access to this project, or it may have been deleted.
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => navigate('/dashboard')}
          leftIcon={<ArrowLeft size={16} />}
          className="mt-2 bg-indigo-600 hover:bg-indigo-700"
        >
          Back to Dashboard
        </Button>
      </div>
    )
  }

  // Active tab check: Overview is active when on exactly `/projects/${projectId}`
  const isOverview = location.pathname === `/projects/${projectId}`

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      {/* ── Breadcrumbs ───────────────────────────────────────────────────── */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500">
        <Link
          to="/dashboard"
          className="hover:text-slate-800 transition-colors"
        >
          Dashboard
        </Link>
        <ChevronRight size={13} className="text-slate-400" />
        <span className="text-slate-400">Projects</span>
        <ChevronRight size={13} className="text-slate-400" />
        <span className="font-semibold text-slate-800 truncate max-w-xs">
          {project.name}
        </span>
      </nav>

      {/* ── Project Header Card ───────────────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          {/* Left: Title, Description, Role */}
          <div className="flex flex-col gap-2 min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl truncate">
                {project.name}
              </h1>
              <RoleBadge role={project.role} />
            </div>

            <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
              {project.description ||
                'Collaborative project workspace for planning and tracking team milestones.'}
            </p>

            {/* Project Code copy pill */}
            <div className="mt-1 flex items-center gap-2">
              <span className="text-xs text-slate-400">Project Code:</span>
              <button
                type="button"
                onClick={handleCopyCode}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-mono text-slate-700 hover:bg-slate-100 hover:border-slate-300 transition-colors"
                title="Click to copy project code"
              >
                <span>{project.code}</span>
                {copiedCode ? (
                  <Check size={12} className="text-emerald-600" />
                ) : (
                  <Copy size={12} className="text-slate-400" />
                )}
              </button>
              {copiedCode && (
                <span className="text-xs font-medium text-emerald-600">
                  Copied!
                </span>
              )}
            </div>
          </div>

          {/* Right: Team Avatars & Progress Bar */}
          <div className="flex flex-col gap-3 min-w-[220px] lg:items-end">
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500 font-medium">Team:</span>
              <AvatarGroup
                names={
                  members.length > 0
                    ? members.map((m) => m.name)
                    : ['Team Member']
                }
                max={4}
                size="sm"
              />
              <Link
                to={`/projects/${projectId}/members`}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 ml-1"
              >
                +{members.length}
              </Link>
            </div>

            {/* Overall Progress */}
            <div className="w-full sm:w-56 flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-500">Overall Progress</span>
                <span className="font-bold text-slate-800">{progress}%</span>
              </div>
              <ProgressBar value={progress} colour="indigo" size="md" />
            </div>
          </div>
        </div>

        {/* ── Tabbed Sub-Navigation ────────────────────────────────────────── */}
        <div className="mt-8 flex border-b border-slate-100 overflow-x-auto gap-1">
          <NavLink
            to={`/projects/${projectId}`}
            end
            className={({ isActive }) =>
              [
                'inline-flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition-colors whitespace-nowrap',
                isActive || isOverview
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300',
              ].join(' ')
            }
          >
            <LayoutDashboard size={16} />
            <span>Overview</span>
          </NavLink>

          <NavLink
            to={`/projects/${projectId}/tasks`}
            className={({ isActive }) =>
              [
                'inline-flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition-colors whitespace-nowrap',
                isActive
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300',
              ].join(' ')
            }
          >
            <Kanban size={16} />
            <span>Tasks</span>
            {tasks.length > 0 && (
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600">
                {tasks.length}
              </span>
            )}
          </NavLink>

          <NavLink
            to={`/projects/${projectId}/members`}
            className={({ isActive }) =>
              [
                'inline-flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition-colors whitespace-nowrap',
                isActive
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300',
              ].join(' ')
            }
          >
            <Users size={16} />
            <span>Members</span>
            {members.length > 0 && (
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600">
                {members.length}
              </span>
            )}
          </NavLink>

          <NavLink
            to={`/projects/${projectId}/settings`}
            className={({ isActive }) =>
              [
                'inline-flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition-colors whitespace-nowrap',
                isActive
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300',
              ].join(' ')
            }
          >
            <Settings size={16} />
            <span>Settings</span>
          </NavLink>
        </div>
      </div>

      {/* ── Sub-Page Content ──────────────────────────────────────────────── */}
      <div className="min-h-[400px]">
        <Outlet
          context={
            {
              project,
              members,
              tasks,
              loading,
              error,
              reload: loadProjectData,
            } satisfies ProjectContextType
          }
        />
      </div>
    </div>
  )
}
