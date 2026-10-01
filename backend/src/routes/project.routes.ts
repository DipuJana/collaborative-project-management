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

import { getProjectMembersController } from "../controllers/projectMember.controller.js";

import { createInvitationController } from "../controllers/invitation.controller.js";

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

router.get(
  "/:projectId/members",
  authenticate,
  getProjectMembersController
);

router.post(
  "/:projectId/invitations",
  authenticate,
  createInvitationController
);

export default router;