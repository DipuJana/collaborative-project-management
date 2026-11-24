export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE'
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH'

export type Task = {
  id: string
  projectId: string
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
  assignedTo: string | null
  createdBy: string
  dueDate: string | null
  createdAt: string
  updatedAt: string
  // Augmented for dashboard display
  projectName?: string
}

export type CreateTaskInput = {
  title: string
  description?: string
  status?: TaskStatus
  priority?: TaskPriority
  assignedTo?: string | null
  dueDate?: string | null
}

export type UpdateTaskInput = Partial<CreateTaskInput>

export type TasksResponse = {
  tasks: Task[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export type TaskResponse = {
  message?: string
  task: Task
}
