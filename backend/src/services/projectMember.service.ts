import prisma from "../config/prisma.js";
import { AppError } from "../errors/app.error.js";

export async function getProjectMembers(
  projectId: bigint,
  userId: bigint
) {
  // First make sure the requesting user belongs to the project.
  const membership = await prisma.projectMember.findUnique({
    where: {
      projectId_userId: {
        projectId,
        userId,
      },
    },
  });

  if (!membership) {
    throw new AppError("Project not found", 404);
  }

  const members = await prisma.projectMember.findMany({
    where: {
      projectId,
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
      joinedAt: "asc",
    },
  });

  return members.map((member) => ({
    userId: member.user.id.toString(),
    name: member.user.name,
    email: member.user.email,
    role: member.role,
    joinedAt: member.joinedAt,
  }));
}