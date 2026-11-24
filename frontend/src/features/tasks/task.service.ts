import { apiRequest } from '../../services/apiClient'
import type {
  CreateTaskInput,
  Task,
  TaskPriority,
  TasksResponse,
  TaskResponse,
  TaskStatus,
  UpdateTaskInput,
} from './task.types'

export async function getProjectTasks(
  projectId: string,
  params?: {
    page?: number
    limit?: number
    status?: TaskStatus
    priority?: TaskPriority
    assignedTo?: string
  },
): Promise<TasksResponse> {
  const queryParams = new URLSearchParams()
  if (params?.page) queryParams.set('page', params.page.toString())
  if (params?.limit) queryParams.set('limit', params.limit.toString())
  if (params?.status) queryParams.set('status', params.status)
  if (params?.priority) queryParams.set('priority', params.priority)
  if (params?.assignedTo) queryParams.set('assignedTo', params.assignedTo)

  const queryStr = queryParams.toString()
  const endpoint = `/projects/${projectId}/tasks${queryStr ? `?${queryStr}` : ''}`

  return apiRequest<TasksResponse>(endpoint, {
    requiresAuth: true,
  })
}

export async function getTaskById(
  projectId: string,
  taskId: string,
): Promise<Task> {
  return apiRequest<Task>(`/projects/${projectId}/tasks/${taskId}`, {
    requiresAuth: true,
  })
}

export async function createTask(
  projectId: string,
  input: CreateTaskInput,
): Promise<Task> {
  const response = await apiRequest<TaskResponse>(
    `/projects/${projectId}/tasks`,
    {
      method: 'POST',
      body: input,
      requiresAuth: true,
    },
  )
  return response.task
}

export async function updateTask(
  projectId: string,
  taskId: string,
  input: UpdateTaskInput,
): Promise<Task> {
  const response = await apiRequest<TaskResponse>(
    `/projects/${projectId}/tasks/${taskId}`,
    {
      method: 'PATCH',
      body: input,
      requiresAuth: true,
    },
  )
  return response.task
}

export async function deleteTask(
  projectId: string,
  taskId: string,
): Promise<void> {
  await apiRequest(`/projects/${projectId}/tasks/${taskId}`, {
    method: 'DELETE',
    requiresAuth: true,
  })
}
