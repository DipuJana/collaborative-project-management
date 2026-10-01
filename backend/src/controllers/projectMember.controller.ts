import type { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/app.error.js";
import { getProjectMembers } from "../services/projectMember.service.js";

export async function getProjectMembersController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const rawProjectId = req.params.projectId;

    if (
      typeof rawProjectId !== "string" ||
      !/^\d+$/.test(rawProjectId)
    ) {
      throw new AppError("Invalid project ID", 400);
    }

    const projectId = BigInt(rawProjectId);

    const members = await getProjectMembers(
      projectId,
      req.user!.id
    );

    res.status(200).json({
      members,
    });
  } catch (error) {
    next(error);
  }
}