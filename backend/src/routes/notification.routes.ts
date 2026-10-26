
import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import {
  getNotificationsController,
  getUnreadNotificationCountController,
  markNotificationAsReadController,
  markAllNotificationsAsReadController,
} from "../controllers/notification.controller.js";

const router = Router();

router.use(authenticate);

router.get("/", getNotificationsController);
router.get("/unread-count", getUnreadNotificationCountController);
router.patch("/read-all", markAllNotificationsAsReadController);
router.patch("/:notificationId/read", markNotificationAsReadController);

export default router;
