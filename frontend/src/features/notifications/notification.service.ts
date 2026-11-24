import { apiRequest } from '../../services/apiClient'
import type {
  NotificationsResponse,
  UnreadCountResponse,
} from './notification.types'

export async function getNotifications(params?: {
  page?: number
  limit?: number
  unreadOnly?: boolean
}): Promise<NotificationsResponse> {
  const queryParams = new URLSearchParams()
  if (params?.page) queryParams.set('page', params.page.toString())
  if (params?.limit) queryParams.set('limit', params.limit.toString())
  if (params?.unreadOnly !== undefined) {
    queryParams.set('unreadOnly', params.unreadOnly.toString())
  }

  const queryStr = queryParams.toString()
  const endpoint = `/notifications${queryStr ? `?${queryStr}` : ''}`

  return apiRequest<NotificationsResponse>(endpoint, {
    requiresAuth: true,
  })
}

export async function getUnreadNotificationCount(): Promise<number> {
  try {
    const response = await apiRequest<UnreadCountResponse>(
      '/notifications/unread-count',
      {
        requiresAuth: true,
      },
    )
    return response.unreadCount
  } catch {
    return 0
  }
}

export async function markNotificationAsRead(
  notificationId: string,
): Promise<void> {
  await apiRequest(`/notifications/${notificationId}/read`, {
    method: 'PATCH',
    requiresAuth: true,
  })
}

export async function markAllNotificationsAsRead(): Promise<void> {
  await apiRequest('/notifications/read-all', {
    method: 'PATCH',
    requiresAuth: true,
  })
}
