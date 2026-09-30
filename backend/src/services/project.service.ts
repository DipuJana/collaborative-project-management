import prisma from "../config/prisma.js";
import { AppError } from "../errors/app.error.js";


export async function createProject(
  ownerId: bigint,
  name: string,
  description?: string,
) {
  return prisma.$transaction(async (tx) => {
    const project = await tx.project.create({
      data: {
        name,
        description: description ?? null,
        code: crypto.randomUUID(),
        ownerId,
      },
    });

    await tx.projectMember.create({
      data: {
        projectId: project.id,
        userId: ownerId,
        role: "OWNER",
      },
    });

    return {
      id: project.id.toString(),
      name: project.name,
      code: project.code,
      description: project.description,
      ownerId: project.ownerId.toString(),
      createdAt: project.createdAt,
    };
  });
}

export async function getUserProjects(userId: bigint) {
  const memberships = await prisma.projectMember.findMany({
    where: {
      userId,
    },
    include: {
      project: true,
    },
    orderBy: {
      project: {
        createdAt: "desc",
      },
    },
  });

  return memberships.map((membership) => ({
    id: membership.project.id.toString(),
    name: membership.project.name,
    code: membership.project.code,
    description: membership.project.description,
    ownerId: membership.project.ownerId.toString(),
    role: membership.role,
    createdAt: membership.project.createdAt,
    updatedAt: membership.project.updatedAt,
  }));
}

export async function getProjectById(
  projectId: bigint,
  userId: bigint,
) {
  const membership = await prisma.projectMember.findUnique({
    where: {
      projectId_userId: {
        projectId,
        userId,
      },
    },
    include: {
      project: true,
    },
  });

  if (!membership) {
    throw new AppError("Project not found", 404);
  }

  return {
    id: membership.project.id.toString(),
    name: membership.project.name,
    code: membership.project.code,
    description: membership.project.description,
    ownerId: membership.project.ownerId.toString(),
    role: membership.role,
    createdAt: membership.project.createdAt,
    updatedAt: membership.project.updatedAt,
  };
}