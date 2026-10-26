
import type { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/app.error.js";
import {
  getNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../services/notification.service.js";

function parseId(value: string | string[] | undefined): bigint {
  if (typeof value !== "string" || !/^[1-9]\d*$/.test(value)) {
    throw new AppError("Invalid notification ID", 400);
  }

  return BigInt(value);
}

function parsePositiveInteger(
  value: unknown,
  defaultValue: number,
  label: string,
  maximum: number,
): number {
  if (value === undefined) return defaultValue;

  if (typeof value !== "string" || !/^[1-9]\d*$/.test(value)) {
    throw new AppError(`Invalid ${label}`, 400);
  }

  const parsed = Number(value);

  if (!Number.isSafeInteger(parsed) || parsed > maximum) {
    throw new AppError(`${label} must not exceed ${maximum}`, 400);
  }

  return parsed;
}

export async function getNotificationsController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const page = parsePositiveInteger(req.query.page, 1, "page", 1000000);
    const limit = parsePositiveInteger(req.query.limit, 10, "limit", 100);

    const unreadOnlyQuery = req.query.unreadOnly;

    if (
      unreadOnlyQuery !== undefined &&
      unreadOnlyQuery !== "true" &&
      unreadOnlyQuery !== "false"
    ) {
      throw new AppError("unreadOnly must be true or false", 400);
    }

    const result = await getNotifications(
      req.user!.id,
      page,
      limit,
      unreadOnlyQuery === "true",
    );

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function getUnreadNotificationCountController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const result = await getUnreadNotificationCount(req.user!.id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function markNotificationAsReadController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const notificationId = parseId(req.params.notificationId);
    const notification = await markNotificationAsRead(
      req.user!.id,
      notificationId,
    );

    res.status(200).json({
      message: "Notification marked as read",
      notification,
    });
  } catch (error) {
    next(error);
  }
}

export async function markAllNotificationsAsReadController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const result = await markAllNotificationsAsRead(req.user!.id);

    res.status(200).json({
      message: "All notifications marked as read",
      ...result,
    });
  } catch (error) {
    next(error);
  }
}
