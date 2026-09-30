import type { NextFunction, Request, Response } from "express";
import {
  createProject as createProjectService,
  getUserProjects,
} from "../services/project.service.js";

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