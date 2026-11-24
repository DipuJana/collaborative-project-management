import { useMemo } from 'react'
import { Link, useOutletContext, useParams } from 'react-router-dom'
import {
  AlertCircle,
  ArrowDown,
  ArrowRight,
  CheckCircle2,
  Clock,
  ListTodo,
  Minus,
  Plus,
  TrendingUp,
  UserPlus,
  Users,
} from 'lucide-react'
import type { ProjectContextType } from '../layouts/ProjectLayout'
import type { TaskPriority } from '../features/tasks/task.types'
import { Card } from '../components/ui/Card'
import { StatusBadge, RoleBadge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { ProgressBar } from '../components/ui/ProgressBar'
import { Avatar } from '../components/ui/Avatar'
import { SkeletonCard } from '../components/ui/Skeleton'

export default function ProjectOverviewPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const { project, members, tasks, loading } =
    useOutletContext<ProjectContextType>()

  // Calculate stats
  const totalTasks = tasks.length
  const doneTasks = useMemo(
    () => tasks.filter((t) => t.status === 'DONE'),
    [tasks],
  )
  const inProgressTasks = useMemo(
    () => tasks.filter((t) => t.status === 'IN_PROGRESS'),
    [tasks],
  )
  const todoTasks = useMemo(
    () => tasks.filter((t) => t.status === 'TODO'),
    [tasks],
  )

  const progress =
    totalTasks === 0 ? 0 : Math.round((doneTasks.length / totalTasks) * 100)

  // Priority counts
  const highPriority = tasks.filter((t) => t.priority === 'HIGH').length
  const mediumPriority = tasks.filter((t) => t.priority === 'MEDIUM').length
  const lowPriority = tasks.filter((t) => t.priority === 'LOW').length

  // Recent 5 tasks
  const recentTasks = useMemo(() => tasks.slice(0, 5), [tasks])

  function formatPriority(priority: TaskPriority) {
    if (priority === 'HIGH') {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600">
          <AlertCircle size={13} />
          High
        </span>
      )
    }
    if (priority === 'MEDIUM') {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-orange-600">
          <Minus size={13} />
          Medium
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
        <ArrowDown size={13} />
        Low
      </span>
    )
  }

  function getAssigneeName(assignedTo: string | null) {
    if (!assignedTo) return 'Unassigned'
    const member = members.find((m) => m.userId === assignedTo)
    return member?.name || 'Assigned'
  }

  if (loading && !project) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      {/* ── 4 Summary Metric Cards ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Tasks */}
        <Card className="flex items-center gap-3.5 p-4 sm:p-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <ListTodo size={22} />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Total Tasks</p>
            <p className="text-2xl font-bold text-slate-900">{totalTasks}</p>
          </div>
        </Card>

        {/* Done Tasks */}
        <Card className="flex items-center gap-3.5 p-4 sm:p-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 size={22} />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Completed</p>
            <p className="text-2xl font-bold text-slate-900">{doneTasks.length}</p>
          </div>
        </Card>

        {/* In Progress */}
        <Card className="flex items-center gap-3.5 p-4 sm:p-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <Clock size={22} />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">In Progress</p>
            <p className="text-2xl font-bold text-slate-900">
              {inProgressTasks.length}
            </p>
          </div>
        </Card>

        {/* Team Members */}
        <Card className="flex items-center gap-3.5 p-4 sm:p-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
            <Users size={22} />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Team Members</p>
            <p className="text-2xl font-bold text-slate-900">{members.length}</p>
          </div>
        </Card>
      </div>

      {/* ── Progress Breakdown & Quick Actions Grid ───────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Progress & Task Status Breakdown */}
        <Card className="lg:col-span-2 p-6 flex flex-col justify-between gap-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Task Completion Status
                </h2>
                <p className="text-xs text-slate-500">
                  Progress tracking across all active and finished tasks.
                </p>
              </div>
              <span className="text-2xl font-extrabold text-indigo-600">
                {progress}%
              </span>
            </div>

            {/* Main Progress Bar */}
            <ProgressBar value={progress} colour="indigo" size="md" />

            {/* Status Breakdown Pills */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5">
                <span className="text-xs text-slate-500 font-medium">To Do</span>
                <p className="text-xl font-bold text-slate-800 mt-0.5">
                  {todoTasks.length}
                </p>
              </div>
              <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-3.5">
                <span className="text-xs text-indigo-600 font-medium">
                  In Progress
                </span>
                <p className="text-xl font-bold text-indigo-700 mt-0.5">
                  {inProgressTasks.length}
                </p>
              </div>
              <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-3.5">
                <span className="text-xs text-emerald-600 font-medium">Done</span>
                <p className="text-xl font-bold text-emerald-700 mt-0.5">
                  {doneTasks.length}
                </p>
              </div>
            </div>
          </div>

          {/* Priority Breakdown */}
          <div className="flex items-center justify-between border-t border-slate-100 pt-4 text-xs text-slate-500">
            <div className="flex items-center gap-1.5 font-medium">
              <TrendingUp size={15} className="text-indigo-600" />
              <span>Priorities:</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-rose-600 font-semibold">
                <span className="h-2 w-2 rounded-full bg-rose-500" />
                {highPriority} High
              </span>
              <span className="flex items-center gap-1.5 text-orange-600 font-semibold">
                <span className="h-2 w-2 rounded-full bg-orange-500" />
                {mediumPriority} Medium
              </span>
              <span className="flex items-center gap-1.5 text-emerald-600 font-semibold">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                {lowPriority} Low
              </span>
            </div>
          </div>
        </Card>

        {/* Quick Actions & Workspace Info */}
        <Card className="p-6 flex flex-col justify-between gap-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">Workspace Actions</h3>
            <p className="mt-1 text-xs text-slate-500">
              Jump straight into managing tasks and team members.
            </p>

            <div className="mt-5 flex flex-col gap-2.5">
              <Link to={`/projects/${projectId}/tasks`}>
                <Button
                  variant="primary"
                  className="w-full justify-start gap-2.5 bg-indigo-600 hover:bg-indigo-700 font-semibold"
                  leftIcon={<Plus size={16} />}
                >
                  Go to Kanban Tasks
                </Button>
              </Link>

              <Link to={`/projects/${projectId}/members`}>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2.5 font-semibold text-slate-700"
                  leftIcon={<UserPlus size={16} />}
                >
                  Invite Team Members
                </Button>
              </Link>
            </div>
          </div>

          {/* Member preview snippet */}
          <div className="border-t border-slate-100 pt-4">
            <div className="flex items-center justify-between mb-3 text-xs">
              <span className="font-semibold text-slate-700">Team Roster</span>
              <Link
                to={`/projects/${projectId}/members`}
                className="text-indigo-600 font-semibold hover:underline"
              >
                View all ({members.length})
              </Link>
            </div>
            <div className="flex flex-col gap-2">
              {members.slice(0, 3).map((member) => (
                <div
                  key={member.userId}
                  className="flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2 truncate">
                    <Avatar name={member.name} size="xs" />
                    <span className="font-medium text-slate-800 truncate">
                      {member.name}
                    </span>
                  </div>
                  <RoleBadge role={member.role} />
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* ── Recent Activity / Tasks Table ─────────────────────────────────── */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Recent Tasks</h2>
            <p className="text-xs text-slate-500">
              Latest tasks created or updated in this project.
            </p>
          </div>
          <Link
            to={`/projects/${projectId}/tasks`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
          >
            <span>Open Kanban Board</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <Card padding={false} className="overflow-hidden">
          {recentTasks.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500">
              No tasks created yet in this workspace. Click{' '}
              <Link
                to={`/projects/${projectId}/tasks`}
                className="text-indigo-600 font-semibold underline"
              >
                Kanban Tasks
              </Link>{' '}
              to add your first task!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-3 px-5">Task Title</th>
                    <th className="py-3 px-5">Status</th>
                    <th className="py-3 px-5">Priority</th>
                    <th className="py-3 px-5">Assignee</th>
                    <th className="py-3 px-5">Due Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentTasks.map((task) => (
                    <tr
                      key={task.id}
                      className="hover:bg-slate-50/60 transition-colors"
                    >
                      <td className="py-3.5 px-5 font-semibold text-slate-800">
                        {task.title}
                      </td>
                      <td className="py-3.5 px-5">
                        <StatusBadge status={task.status} />
                      </td>
                      <td className="py-3.5 px-5">
                        {formatPriority(task.priority)}
                      </td>
                      <td className="py-3.5 px-5 text-xs text-slate-600">
                        {getAssigneeName(task.assignedTo)}
                      </td>
                      <td className="py-3.5 px-5 text-xs text-slate-500">
                        {task.dueDate || 'No due date'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </section>
    </div>
  )
}
