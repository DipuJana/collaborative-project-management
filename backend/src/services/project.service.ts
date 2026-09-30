import prisma from "../config/prisma.js";

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