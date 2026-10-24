
import type { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/app.error.js";
import {
  createTask,
  getProjectTasks,
  getTaskById,
  updateTask,
  deleteTask,
} from "../services/task.service.js";
import {
  createTaskSchema,
  updateTaskSchema,
} from "../validators/task.validator.js";

function parseId(value: string | string[] | undefined, label: string): bigint {
  if (typeof value !== "string" || !/^[1-9]\d*$/.test(value)) {
    throw new AppError(`Invalid ${label}`, 400);
  }

  return BigInt(value);
}

function parsePositiveInteger(
  value: unknown,
  defaultValue: number,
  label: string,
  maximum: number
): number {
  if (value === undefined) return defaultValue;

  if (
    typeof value !== "string" ||
    !/^[1-9]\d*$/.test(value)
  ) {
    throw new AppError(`Invalid ${label}`, 400);
  }

  const parsed = Number(value);

  if (!Number.isSafeInteger(parsed) || parsed > maximum) {
    throw new AppError(`${label} must not exceed ${maximum}`, 400);
  }

  return parsed;
}

export async function createTaskController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const projectId = parseId(req.params.projectId, "project ID");
    const parsed = createTaskSchema.safeParse(req.body);

    if (!parsed.success) {
      throw new AppError(
        parsed.error.issues.map((issue) => issue.message).join(", "),
        400
      );
    }

    const task = await createTask(projectId, req.user!.id, parsed.data);

    res.status(201).json({
      message: "Task created successfully",
      task,
    });
  } catch (error) {
    next(error);
  }
}

export async function getProjectTasksController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const projectId = parseId(req.params.projectId, "project ID");

    const page = parsePositiveInteger(req.query.page, 1, "page", 1000000);
    const limit = parsePositiveInteger(req.query.limit, 10, "limit", 100);

    const status = req.query.status;
    const priority = req.query.priority;
    const assignedTo = req.query.assignedTo;

    if (
      status !== undefined &&
      (typeof status !== "string" ||
        !["TODO", "IN_PROGRESS", "DONE"].includes(status))
    ) {
      throw new AppError("Invalid task status filter", 400);
    }

    if (
      priority !== undefined &&
      (typeof priority !== "string" ||
        !["LOW", "MEDIUM", "HIGH"].includes(priority))
    ) {
      throw new AppError("Invalid task priority filter", 400);
    }

    if (
      assignedTo !== undefined &&
      (typeof assignedTo !== "string" || !/^[1-9]\d*$/.test(assignedTo))
    ) {
      throw new AppError("Invalid assignee ID filter", 400);
    }

    const result = await getProjectTasks(projectId, req.user!.id, {
      page,
      limit,
      ...(status !== undefined
        ? { status: status as "TODO" | "IN_PROGRESS" | "DONE" }
        : {}),
      ...(priority !== undefined
        ? { priority: priority as "LOW" | "MEDIUM" | "HIGH" }
        : {}),
      ...(assignedTo !== undefined ? { assignedTo } : {}),
    });

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function getTaskByIdController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const projectId = parseId(req.params.projectId, "project ID");
    const taskId = parseId(req.params.taskId, "task ID");

    const task = await getTaskById(projectId, taskId, req.user!.id);

    res.status(200).json({ task });
  } catch (error) {
    next(error);
  }
}

export async function updateTaskController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const projectId = parseId(req.params.projectId, "project ID");
    const taskId = parseId(req.params.taskId, "task ID");
    const parsed = updateTaskSchema.safeParse(req.body);

    if (!parsed.success) {
      throw new AppError(
        parsed.error.issues.map((issue) => issue.message).join(", "),
        400
      );
    }

    const task = await updateTask(
      projectId,
      taskId,
      req.user!.id,
      parsed.data
    );

    res.status(200).json({
      message: "Task updated successfully",
      task,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteTaskController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const projectId = parseId(req.params.projectId, "project ID");
    const taskId = parseId(req.params.taskId, "task ID");

    await deleteTask(projectId, taskId, req.user!.id);

    res.status(200).json({
      message: "Task deleted successfully",
    });
  } catch (error) {
    next(error);
  }
}
