
import prisma from "../config/prisma.js";
import { AppError } from "../errors/app.error.js";

export async function createInvitation(
  projectId: bigint,
  inviterId: bigint,
  email: string
) {
  // 1. Check inviter's membership and role.
  const inviterMembership = await prisma.projectMember.findUnique({
    where: {
      projectId_userId: {
        projectId,
        userId: inviterId,
      },
    },
  });

  if (!inviterMembership) {
    throw new AppError("Project not found", 404);
  }

  if (
    inviterMembership.role !== "OWNER" &&
    inviterMembership.role !== "ADMIN"
  ) {
    throw new AppError(
      "You do not have permission to invite members",
      403
    );
  }

  // 2. Find the user being invited.
  const invitedUser = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!invitedUser) {
    throw new AppError("User not found", 404);
  }

  // 3. Prevent inviting an existing member.
  const existingMembership = await prisma.projectMember.findUnique({
    where: {
      projectId_userId: {
        projectId,
        userId: invitedUser.id,
      },
    },
  });

  if (existingMembership) {
    throw new AppError("User is already a project member", 409);
  }

  // 4. Prevent duplicate pending invitations.
  const existingInvitation = await prisma.projectInvitation.findFirst({
    where: {
      projectId,
      invitedUserId: invitedUser.id,
      status: "PENDING",
    },
  });

  if (existingInvitation) {
    throw new AppError("A pending invitation already exists", 409);
  }

  // 5. Create invitation and notification atomically.
  return prisma.$transaction(async (tx) => {
    const invitation = await tx.projectInvitation.create({
      data: {
        projectId,
        invitedUserId: invitedUser.id,
        invitedBy: inviterId,
      },
    });

    await tx.notification.create({
      data: {
        userId: invitedUser.id,
        type: "PROJECT_INVITATION",
        message: "You have been invited to join a project.",
        relatedProjectId: projectId,
        relatedEntityId: invitation.id,
      },
    });

    return {
      id: invitation.id.toString(),
      projectId: invitation.projectId.toString(),
      invitedUserId: invitation.invitedUserId.toString(),
      invitedBy: invitation.invitedBy.toString(),
      status: invitation.status,
      createdAt: invitation.createdAt,
    };
  });
}

export async function getMyInvitations(userId: bigint) {
  const invitations = await prisma.projectInvitation.findMany({
    where: {
      invitedUserId: userId,
      status: "PENDING",
    },
    include: {
      project: {
        select: {
          id: true,
          name: true,
          code: true,
        },
      },
      inviter: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return invitations.map((invitation) => ({
    id: invitation.id.toString(),
    projectId: invitation.project.id.toString(),
    projectName: invitation.project.name,
    projectCode: invitation.project.code,
    invitedBy: {
      id: invitation.inviter.id.toString(),
      name: invitation.inviter.name,
      email: invitation.inviter.email,
    },
    status: invitation.status,
    createdAt: invitation.createdAt,
  }));
}

export async function acceptInvitation(
  invitationId: bigint,
  userId: bigint
) {
  return prisma.$transaction(async (tx) => {
    const invitation = await tx.projectInvitation.findUnique({
      where: {
        id: invitationId,
      },
    });

    // Hide invitations that do not exist or belong to another user.
    if (!invitation || invitation.invitedUserId !== userId) {
      throw new AppError("Invitation not found", 404);
    }

    if (invitation.status !== "PENDING") {
      throw new AppError("Invitation has already been processed", 409);
    }

    const existingMembership = await tx.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId: invitation.projectId,
          userId,
        },
      },
    });

    if (existingMembership) {
      throw new AppError("You are already a project member", 409);
    }

    // Atomically claim the pending invitation.
    const updated = await tx.projectInvitation.updateMany({
      where: {
        id: invitationId,
        invitedUserId: userId,
        status: "PENDING",
      },
      data: {
        status: "ACCEPTED",
        respondedAt: new Date(),
      },
    });

    if (updated.count === 0) {
      throw new AppError("Invitation has already been processed", 409);
    }

    // Create project membership in the same transaction.
    await tx.projectMember.create({
      data: {
        projectId: invitation.projectId,
        userId,
        role: "MEMBER",
      },
    });

    // Notify the user who sent the invitation.
    await tx.notification.create({
      data: {
        userId: invitation.invitedBy,
        type: "INVITATION_ACCEPTED",
        message: "Your project invitation was accepted.",
        relatedProjectId: invitation.projectId,
        relatedEntityId: invitation.id,
      },
    });

    return {
      invitationId: invitation.id.toString(),
      projectId: invitation.projectId.toString(),
      status: "ACCEPTED",
    };
  });
}

export async function rejectInvitation(
  invitationId: bigint,
  userId: bigint
) {
  return prisma.$transaction(async (tx) => {
    const invitation = await tx.projectInvitation.findUnique({
      where: {
        id: invitationId,
      },
    });

    if (!invitation || invitation.invitedUserId !== userId) {
      throw new AppError("Invitation not found", 404);
    }

    if (invitation.status !== "PENDING") {
      throw new AppError("Invitation has already been processed", 409);
    }

    const updated = await tx.projectInvitation.updateMany({
      where: {
        id: invitationId,
        invitedUserId: userId,
        status: "PENDING",
      },
      data: {
        status: "REJECTED",
        respondedAt: new Date(),
      },
    });

    if (updated.count === 0) {
      throw new AppError("Invitation has already been processed", 409);
    }

    // Notify the user who sent the invitation.
    await tx.notification.create({
      data: {
        userId: invitation.invitedBy,
        type: "INVITATION_REJECTED",
        message: "Your project invitation was rejected.",
        relatedProjectId: invitation.projectId,
        relatedEntityId: invitation.id,
      },
    });

    return {
      invitationId: invitation.id.toString(),
      projectId: invitation.projectId.toString(),
      status: "REJECTED",
    };
  });
}
