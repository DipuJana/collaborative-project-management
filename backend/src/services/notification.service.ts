
import prisma from "../config/prisma.js";
import { AppError } from "../errors/app.error.js";

type NotificationRecord = {
  id: bigint;
  userId: bigint;
  type: string;
  message: string;
  relatedProjectId: bigint | null;
  relatedEntityId: bigint | null;
  isRead: boolean;
  createdAt: Date;
};

function serializeNotification(notification: NotificationRecord) {
  return {
    id: notification.id.toString(),
    userId: notification.userId.toString(),
    type: notification.type,
    message: notification.message,
    relatedProjectId: notification.relatedProjectId?.toString() ?? null,
    relatedEntityId: notification.relatedEntityId?.toString() ?? null,
    isRead: notification.isRead,
    createdAt: notification.createdAt.toISOString(),
  };
}

export async function getNotifications(
  userId: bigint,
  page: number,
  limit: number,
  unreadOnly: boolean,
) {
  const where = {
    userId,
    ...(unreadOnly ? { isRead: false } : {}),
  };

  const [notifications, total] = await prisma.$transaction([
    prisma.notification.findMany({
      where,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.notification.count({ where }),
  ]);

  return {
    notifications: notifications.map(serializeNotification),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getUnreadNotificationCount(userId: bigint) {
  const count = await prisma.notification.count({
    where: { userId, isRead: false },
  });

  return { unreadCount: count };
}

export async function markNotificationAsRead(
  userId: bigint,
  notificationId: bigint,
) {
  const result = await prisma.notification.updateMany({
    where: {
      id: notificationId,
      userId,
      isRead: false,
    },
    data: { isRead: true },
  });

  if (result.count === 0) {
    const notification = await prisma.notification.findFirst({
      where: { id: notificationId, userId },
      select: { id: true },
    });

    if (!notification) {
      throw new AppError("Notification not found", 404);
    }
  }

  const notification = await prisma.notification.findFirstOrThrow({
    where: { id: notificationId, userId },
  });

  return serializeNotification(notification);
}

export async function markAllNotificationsAsRead(userId: bigint) {
  const result = await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });

  return { updatedCount: result.count };
}
