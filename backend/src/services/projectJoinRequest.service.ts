
import prisma from "../config/prisma.js";
import { AppError } from "../errors/app.error.js";

export async function createJoinRequest(
  userId: bigint,
  projectCode: string
) {
  const project = await prisma.project.findUnique({
    where: { code: projectCode },
    select: { id: true, name: true, code: true },
  });

  if (!project) {
    throw new AppError("Project not found", 404);
  }

  const existingMembership = await prisma.projectMember.findUnique({
    where: {
      projectId_userId: {
        projectId: project.id,
        userId,
      },
    },
  });

  if (existingMembership) {
    throw new AppError("You are already a project member", 409);
  }

  const existingRequest = await prisma.projectJoinRequest.findFirst({
    where: {
      projectId: project.id,
      userId,
      status: "PENDING",
    },
  });

  if (existingRequest) {
    throw new AppError("A pending join request already exists", 409);
  }

  const request = await prisma.projectJoinRequest.create({
    data: {
      projectId: project.id,
      userId,
    },
  });

  return {
    id: request.id.toString(),
    projectId: project.id.toString(),
    projectName: project.name,
    projectCode: project.code,
    status: request.status,
    createdAt: request.createdAt,
  };
}

export async function getProjectJoinRequests(
  projectId: bigint,
  requesterId: bigint
) {
  const membership = await prisma.projectMember.findUnique({
    where: {
      projectId_userId: {
        projectId,
        userId: requesterId,
      },
    },
  });

  if (!membership) {
    throw new AppError("Project not found", 404);
  }

  if (membership.role !== "OWNER" && membership.role !== "ADMIN") {
    throw new AppError(
      "You do not have permission to view join requests",
      403
    );
  }

  const requests = await prisma.projectJoinRequest.findMany({
    where: {
      projectId,
      status: "PENDING",
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  return requests.map((request) => ({
    id: request.id.toString(),
    projectId: request.projectId.toString(),
    user: {
      id: request.user.id.toString(),
      name: request.user.name,
      email: request.user.email,
    },
    status: request.status,
    createdAt: request.createdAt,
  }));
}

export async function approveJoinRequest(
  projectId: bigint,
  requestId: bigint,
  responderId: bigint
) {
  return prisma.$transaction(async (tx) => {
    const membership = await tx.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId: responderId,
        },
      },
    });

    if (!membership) {
      throw new AppError("Project not found", 404);
    }

    if (membership.role !== "OWNER" && membership.role !== "ADMIN") {
      throw new AppError(
        "You do not have permission to approve join requests",
        403
      );
    }

    const request = await tx.projectJoinRequest.findFirst({
      where: {
        id: requestId,
        projectId,
      },
    });

    if (!request) {
      throw new AppError("Join request not found", 404);
    }

    if (request.status !== "PENDING") {
      throw new AppError("Join request has already been processed", 409);
    }

    if (request.userId === responderId) {
      throw new AppError("You cannot approve your own join request", 403);
    }

    const updated = await tx.projectJoinRequest.updateMany({
      where: {
        id: requestId,
        projectId,
        status: "PENDING",
      },
      data: {
        status: "APPROVED",
        respondedAt: new Date(),
        respondedBy: responderId,
      },
    });

    if (updated.count === 0) {
      throw new AppError("Join request has already been processed", 409);
    }

    await tx.projectMember.create({
      data: {
        projectId,
        userId: request.userId,
        role: "MEMBER",
      },
    });

    return {
      id: request.id.toString(),
      projectId: projectId.toString(),
      userId: request.userId.toString(),
      status: "APPROVED",
    };
  });
}

export async function rejectJoinRequest(
  projectId: bigint,
  requestId: bigint,
  responderId: bigint
) {
  return prisma.$transaction(async (tx) => {
    const membership = await tx.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId: responderId,
        },
      },
    });

    if (!membership) {
      throw new AppError("Project not found", 404);
    }

    if (membership.role !== "OWNER" && membership.role !== "ADMIN") {
      throw new AppError(
        "You do not have permission to reject join requests",
        403
      );
    }

    const request = await tx.projectJoinRequest.findFirst({
      where: {
        id: requestId,
        projectId,
      },
    });

    if (!request) {
      throw new AppError("Join request not found", 404);
    }

    if (request.status !== "PENDING") {
      throw new AppError("Join request has already been processed", 409);
    }

    const updated = await tx.projectJoinRequest.updateMany({
      where: {
        id: requestId,
        projectId,
        status: "PENDING",
      },
      data: {
        status: "REJECTED",
        respondedAt: new Date(),
        respondedBy: responderId,
      },
    });

    if (updated.count === 0) {
      throw new AppError("Join request has already been processed", 409);
    }

    return {
      id: request.id.toString(),
      projectId: projectId.toString(),
      userId: request.userId.toString(),
      status: "REJECTED",
    };
  });
}
