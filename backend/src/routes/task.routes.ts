
import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import {
  createTaskController,
  getProjectTasksController,
  getTaskByIdController,
  updateTaskController,
  deleteTaskController,
} from "../controllers/task.controller.js";

const router = Router();

router.post("/:projectId/tasks", authenticate, createTaskController);
router.get("/:projectId/tasks", authenticate, getProjectTasksController);
router.get("/:projectId/tasks/:taskId", authenticate, getTaskByIdController);
router.patch("/:projectId/tasks/:taskId", authenticate, updateTaskController);
router.delete("/:projectId/tasks/:taskId", authenticate, deleteTaskController);

export default router;
