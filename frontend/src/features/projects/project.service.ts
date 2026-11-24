import { apiRequest } from '../../services/apiClient'
import type {
  CreateProjectInput,
  Project,
  ProjectListResponse,
  ProjectResponse,
  UpdateProjectInput,
} from './project.types'

export async function getProjects(): Promise<Project[]> {
  const response = await apiRequest<ProjectListResponse>('/projects', {
    requiresAuth: true,
  })
  return response.projects
}

export async function getProjectById(projectId: string): Promise<Project> {
  const response = await apiRequest<ProjectResponse>(`/projects/${projectId}`, {
    requiresAuth: true,
  })
  return response.project
}

export async function createProject(input: CreateProjectInput): Promise<Project> {
  const response = await apiRequest<ProjectResponse>('/projects', {
    method: 'POST',
    body: input,
    requiresAuth: true,
  })
  return response.project
}

export async function updateProject(
  projectId: string,
  input: UpdateProjectInput,
): Promise<Project> {
  const response = await apiRequest<ProjectResponse>(`/projects/${projectId}`, {
    method: 'PATCH',
    body: input,
    requiresAuth: true,
  })
  return response.project
}

export async function deleteProject(projectId: string): Promise<void> {
  await apiRequest(`/projects/${projectId}`, {
    method: 'DELETE',
    requiresAuth: true,
  })
}

export async function joinProjectByCode(projectCode: string): Promise<{ message: string }> {
  return apiRequest<{ message: string }>('/projects/join-requests', {
    method: 'POST',
    body: { projectCode },
    requiresAuth: true,
  })
}

