export type Notification = {
  id: string
  userId: string
  type: string
  message: string
  relatedProjectId: string | null
  relatedEntityId: string | null
  isRead: boolean
  createdAt: string
  relatedProject?: {
    id: string
    name: string
  } | null
}

export type NotificationsResponse = {
  notifications: Notification[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export type UnreadCountResponse = {
  unreadCount: number
}
