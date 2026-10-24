
import type { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/app.error.js";
import {
  createJoinRequest,
  getProjectJoinRequests,
  approveJoinRequest,
  rejectJoinRequest,
} from "../services/projectJoinRequest.service.js";

function parseId(value: string | string[] | undefined, label: string): bigint {
  if (typeof value !== "string" || !/^[1-9]\d*$/.test(value)) {
    throw new AppError(`Invalid ${label}`, 400);
  }

  return BigInt(value);
}

export async function createJoinRequestController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const code = req.body?.projectCode;

    if (typeof code !== "string" || code.trim().length === 0) {
      throw new AppError("Project code is required", 400);
    }

    const request = await createJoinRequest(req.user!.id, code.trim());

    res.status(201).json({
      message: "Join request created successfully",
      request,
    });
  } catch (error) {
    next(error);
  }
}

export async function getProjectJoinRequestsController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const projectId = parseId(req.params.projectId, "project ID");

    const requests = await getProjectJoinRequests(
      projectId,
      req.user!.id
    );

    res.status(200).json({ requests });
  } catch (error) {
    next(error);
  }
}

export async function approveJoinRequestController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const projectId = parseId(req.params.projectId, "project ID");
    const requestId = parseId(req.params.requestId, "join request ID");

    const request = await approveJoinRequest(
      projectId,
      requestId,
      req.user!.id
    );

    res.status(200).json({
      message: "Join request approved successfully",
      request,
    });
  } catch (error) {
    next(error);
  }
}

export async function rejectJoinRequestController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const projectId = parseId(req.params.projectId, "project ID");
    const requestId = parseId(req.params.requestId, "join request ID");

    const request = await rejectJoinRequest(
      projectId,
      requestId,
      req.user!.id
    );

    res.status(200).json({
      message: "Join request rejected successfully",
      request,
    });
  } catch (error) {
    next(error);
  }
}
