import { Router } from "express";

import {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject
} from "../controllers/project.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";

import { validate } from "../middleware/validate.middleware.js";

import { createProjectSchema, updateProjectSchema } from "../validators/project.validator.js";

const router = Router();

router.post(
  "/",
  authenticate,
  validate(createProjectSchema),
  createProject,
);

router.get(
  "/",
  authenticate,
  getProjects,
);

router.get(
  "/:projectId",
  authenticate,
  getProjectById,
);

router.patch(
  "/:projectId",
  authenticate,
  validate(updateProjectSchema),
  updateProject
);

router.delete(
  "/:projectId",
  authenticate,
  deleteProject
);

export default router;