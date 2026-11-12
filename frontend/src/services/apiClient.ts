
const API_BASE_URL = '/api'

const TOKEN_KEY = 'projectflow_token'

export class ApiError extends Error {
  status: number
  details?: Array<{ field: string; message: string }>

  constructor(
    message: string,
    status: number,
    details?: Array<{ field: string; message: string }>,
  ) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = details
  }
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'
  body?: unknown
  requiresAuth?: boolean
}

export function getToken(): string | null {
  return sessionStorage.getItem(TOKEN_KEY)
}

export function saveToken(token: string): void {
  sessionStorage.setItem(TOKEN_KEY, token)
}

export function clearToken(): void {
  sessionStorage.removeItem(TOKEN_KEY)
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  const {
    method = 'GET',
    body,
    requiresAuth = false,
  } = options

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  }

  if (requiresAuth) {
    const token = getToken()

    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  })

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    throw new ApiError(
      data?.error ?? 'Something went wrong',
      response.status,
      data?.details,
    )
  }

  return data as T
}
