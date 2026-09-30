import { Router } from "express";
import { createProject,getProjects } from "../controllers/project.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { createProjectSchema } from "../validators/project.validator.js";

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

export default router;