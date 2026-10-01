import prisma from "../config/prisma.js";
import { AppError } from "../errors/app.error.js";

export async function createInvitation(
  projectId: bigint,
  inviterId: bigint,
  email: string
) {
  // 1. Check inviter's membership and role
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

  // 2. Find the user being invited
  const invitedUser = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!invitedUser) {
    throw new AppError("User not found", 404);
  }

  // 3. Prevent inviting an existing member
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

  // 4. Prevent duplicate pending invitation
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

  // 5. Create invitation
  const invitation = await prisma.projectInvitation.create({
    data: {
      projectId,
      invitedUserId: invitedUser.id,
      invitedBy: inviterId,
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
}