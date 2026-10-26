
import prisma from "../config/prisma.js";
import { AppError } from "../errors/app.error.js";

export async function createJoinRequest(
  userId: bigint,
  projectCode: string
) {
  const project = await prisma.project.findUnique({
    where: {
      code: projectCode,
    },
    select: {
      id: true,
      name: true,
      code: true,
    },
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

  // Create the join request and notify project owners/admins atomically.
  const request = await prisma.$transaction(async (tx) => {
    const createdRequest = await tx.projectJoinRequest.create({
      data: {
        projectId: project.id,
        userId,
      },
    });

    const admins = await tx.projectMember.findMany({
      where: {
        projectId: project.id,
        role: {
          in: ["OWNER", "ADMIN"],
        },
      },
      select: {
        userId: true,
      },
    });

    if (admins.length > 0) {
      await tx.notification.createMany({
        data: admins.map((admin) => ({
          userId: admin.userId,
          type: "JOIN_REQUEST_CREATED",
          message: `A user has requested to join project ${project.name}.`,
          relatedProjectId: project.id,
          relatedEntityId: createdRequest.id,
        })),
      });
    }

    return createdRequest;
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

    // Add the requester to the project.
    await tx.projectMember.create({
      data: {
        projectId,
        userId: request.userId,
        role: "MEMBER",
      },
    });

    // Notify the requester.
    await tx.notification.create({
      data: {
        userId: request.userId,
        type: "JOIN_REQUEST_APPROVED",
        message: "Your request to join the project was approved.",
        relatedProjectId: projectId,
        relatedEntityId: request.id,
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

    // Notify the requester.
    await tx.notification.create({
      data: {
        userId: request.userId,
        type: "JOIN_REQUEST_REJECTED",
        message: "Your request to join the project was rejected.",
        relatedProjectId: projectId,
        relatedEntityId: request.id,
      },
    });

    return {
      id: request.id.toString(),
      projectId: projectId.toString(),
      userId: request.userId.toString(),
      status: "REJECTED",
    };
  });
}
