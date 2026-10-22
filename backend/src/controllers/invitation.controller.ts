import type { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/app.error.js";
import { createInvitation, getMyInvitations, acceptInvitation, rejectInvitation } from "../services/invitation.service.js";
import { string } from "zod";

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

export async function getMyInvitationsController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const invitations = await getMyInvitations(req.user!.id);

    res.status(200).json({
      invitations,
    });
  } catch (error) {
    next(error);
  }
}

export async function acceptInvitationController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const invitationId = req.params.invitationId;

    if (typeof invitationId !== "string" || !/^\d+$/.test(invitationId)) {
      throw new AppError("Invalid invitation ID", 400);
    }

    const result = await acceptInvitation(
      BigInt(invitationId),
      req.user!.id
    );

    res.status(200).json({
      message: "Invitation accepted successfully",
      invitation: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function rejectInvitationController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const invitationId = req.params.invitationId;

    if (typeof invitationId !== "string" || !/^\d+$/.test(invitationId)) {
      throw new AppError("Invalid invitation ID", 400);
    }

    const result = await rejectInvitation(
      BigInt(invitationId),
      req.user!.id
    );

    res.status(200).json({
      message: "Invitation rejected successfully",
      invitation: result,
    });
  } catch (error) {
    next(error);
  }
}
