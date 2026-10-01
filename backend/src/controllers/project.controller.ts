import type { NextFunction, Request, Response } from "express";
import {
  createProject as createProjectService,
  getUserProjects,
  getProjectById as getProjectByIdService,
  updateProject as updateProjectService,
  deleteProject as deleteProjectService,
} from "../services/project.service.js";
import { AppError } from "../errors/app.error.js";

export async function createProject(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { name, description } = req.body;

    const project = await createProjectService(
      req.user!.id,
      name,
      description,
    );

    res.status(201).json({
      message: "Project created successfully",
      project,
    });
  } catch (error) {
    next(error);
  }
}

export async function getProjects(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const projects = await getUserProjects(req.user!.id);

    res.status(200).json({
      projects,
    });
  } catch (error) {
    next(error);
  }
}

export async function getProjectById(
  req: Request,
  res: Response,
  next: NextFunction,
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

    const project = await getProjectByIdService(
      projectId,
      req.user!.id,
    );

    res.status(200).json({
      project,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateProject(
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

    const project = await updateProjectService(
      projectId,
      req.user!.id,
      req.body
    );

    res.status(200).json({
      message: "Project updated successfully",
      project,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteProject(
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

    await deleteProjectService(
      projectId,
      req.user!.id
    );

    res.status(204).send();
  } catch (error) {
    next(error);
  }
}