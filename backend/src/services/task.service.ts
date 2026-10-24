
import prisma from "../config/prisma.js";
import { AppError } from "../errors/app.error.js";


type TaskInput = {
  title?: string | undefined;
  description?: string | null | undefined;
  status?: "TODO" | "IN_PROGRESS" | "DONE" | undefined;
  priority?: "LOW" | "MEDIUM" | "HIGH" | undefined;
  assignedTo?: string | null | undefined;
  dueDate?: string | null | undefined;
};


function serializeTask(task: {
  id: bigint;
  projectId: bigint;
  title: string;
  description: string | null;
  status: "TODO" | "IN_PROGRESS" | "DONE";
  priority: "LOW" | "MEDIUM" | "HIGH";
  assignedTo: bigint | null;
  createdBy: bigint;
  dueDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    ...task,
    id: task.id.toString(),
    projectId: task.projectId.toString(),
    assignedTo: task.assignedTo?.toString() ?? null,
    createdBy: task.createdBy.toString(),
    dueDate: task.dueDate?.toISOString().slice(0, 10) ?? null,
  };
}

async function ensureProjectMember(projectId: bigint, userId: bigint) {
  const membership = await prisma.projectMember.findUnique({
    where: {
      projectId_userId: { projectId, userId },
    },
  });

  if (!membership) {
    throw new AppError("Project not found", 404);
  }
}

async function validateAssignee(
  projectId: bigint,
  assignedTo: string | null | undefined
) {
  if (assignedTo === undefined || assignedTo === null) {
    return;
  }

  const assigneeId = BigInt(assignedTo);

  const membership = await prisma.projectMember.findUnique({
    where: {
      projectId_userId: {
        projectId,
        userId: assigneeId,
      },
    },
  });

  if (!membership) {
    throw new AppError("Assignee must be a member of this project", 400);
  }
}

export async function createTask(
  projectId: bigint,
  userId: bigint,
  data: TaskInput
) {
  await ensureProjectMember(projectId, userId);
  await validateAssignee(projectId, data.assignedTo);

  const task = await prisma.task.create({
    data: {
      projectId,
      title: data.title!,
      description: data.description ?? null,
      status: data.status ?? "TODO",
      priority: data.priority ?? "MEDIUM",
      assignedTo:
        data.assignedTo == null ? null : BigInt(data.assignedTo),
      dueDate: data.dueDate ? new Date(`${data.dueDate}T00:00:00.000Z`) : null,
      createdBy: userId,
    },
  });

  return serializeTask(task);
}

type TaskFilters = {
  status?: "TODO" | "IN_PROGRESS" | "DONE";
  priority?: "LOW" | "MEDIUM" | "HIGH";
  assignedTo?: string;
  page: number;
  limit: number;
};

export async function getProjectTasks(
  projectId: bigint,
  userId: bigint,
  filters: TaskFilters
) {
  await ensureProjectMember(projectId, userId);

  const where = {
    projectId,
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.priority ? { priority: filters.priority } : {}),
    ...(filters.assignedTo
      ? { assignedTo: BigInt(filters.assignedTo) }
      : {}),
  };

  const [tasks, total] = await prisma.$transaction([
    prisma.task.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (filters.page - 1) * filters.limit,
      take: filters.limit,
    }),
    prisma.task.count({ where }),
  ]);

  return {
    tasks: tasks.map(serializeTask),
    pagination: {
      page: filters.page,
      limit: filters.limit,
      total,
      totalPages: Math.ceil(total / filters.limit),
    },
  };
}

export async function getTaskById(
  projectId: bigint,
  taskId: bigint,
  userId: bigint
) {
  await ensureProjectMember(projectId, userId);

  const task = await prisma.task.findFirst({
    where: { id: taskId, projectId },
  });

  if (!task) {
    throw new AppError("Task not found", 404);
  }

  return serializeTask(task);
}

export async function updateTask(
  projectId: bigint,
  taskId: bigint,
  userId: bigint,
  data: TaskInput
) {
  await ensureProjectMember(projectId, userId);
  await validateAssignee(projectId, data.assignedTo);

  const existingTask = await prisma.task.findFirst({
    where: { id: taskId, projectId },
    select: { id: true },
  });

  if (!existingTask) {
    throw new AppError("Task not found", 404);
  }

  const task = await prisma.task.update({
    where: { id: taskId },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.description !== undefined && {
        description: data.description,
      }),
      ...(data.status !== undefined && { status: data.status }),
      ...(data.priority !== undefined && { priority: data.priority }),
      ...(data.assignedTo !== undefined && {
        assignedTo:
          data.assignedTo === null ? null : BigInt(data.assignedTo),
      }),
      ...(data.dueDate !== undefined && {
        dueDate: data.dueDate
          ? new Date(`${data.dueDate}T00:00:00.000Z`)
          : null,
      }),
    },
  });

  return serializeTask(task);
}

export async function deleteTask(
  projectId: bigint,
  taskId: bigint,
  userId: bigint
) {
  await ensureProjectMember(projectId, userId);

  const result = await prisma.task.deleteMany({
    where: { id: taskId, projectId },
  });

  if (result.count === 0) {
    throw new AppError("Task not found", 404);
  }
}
