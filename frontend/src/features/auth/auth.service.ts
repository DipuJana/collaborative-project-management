
import { apiRequest, saveToken } from '../../services/apiClient'
import type {
  LoginCredentials,
  LoginResponse,
  RegisterCredentials,
  RegisterResponse,
  User,
} from './auth.types'

export async function login(credentials: LoginCredentials): Promise<User> {
  const response = await apiRequest<LoginResponse>('/auth/login', {
    method: 'POST',
    body: credentials,
  })

  saveToken(response.token)

  return response.user
}

export async function register(credentials: RegisterCredentials): Promise<User> {
  const response = await apiRequest<RegisterResponse>('/auth/register', {
    method: 'POST',
    body: credentials,
  })

  // Extract only the User fields — discard createdAt
  const { id, name, email } = response.user
  return { id, name, email }
}

export async function getCurrentUser(): Promise<string> {
  const response = await apiRequest<{ userId: string }>('/auth/me', {
    requiresAuth: true,
  })

  return response.userId
}
