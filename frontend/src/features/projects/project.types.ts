export type ProjectMemberRole = 'OWNER' | 'ADMIN' | 'MEMBER'

export type Project = {
  id: string
  name: string
  code: string
  description: string | null
  ownerId: string
  role: ProjectMemberRole
  createdAt: string
  // Optional client-side augmented properties (e.g. stats in dashboard)
  totalTasks?: number
  completedTasks?: number
  memberCount?: number
  members?: Array<{
    id: string
    name: string
    email: string
    role: ProjectMemberRole
  }>
}

export type CreateProjectInput = {
  name: string
  description?: string
}

export type UpdateProjectInput = {
  name?: string
  description?: string
}

export type ProjectListResponse = {
  projects: Project[]
}

export type ProjectResponse = {
  message?: string
  project: Project
}
