import type { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/app.error.js";
import { createInvitation } from "../services/invitation.service.js";

export async function createInvitationController(
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

    const { email } = req.body;

    if (typeof email !== "string" || !email.trim()) {
      throw new AppError("Email is required", 400);
    }

    const invitation = await createInvitation(
      BigInt(rawProjectId),
      req.user!.id,
      email.trim().toLowerCase()
    );

    res.status(201).json({
      invitation,
    });
  } catch (error) {
    next(error);
  }
}