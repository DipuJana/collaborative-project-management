import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import {
  createJoinRequestController,
  getProjectJoinRequestsController,
  approveJoinRequestController,
  rejectJoinRequestController,
} from "../controllers/projectJoinRequest.controller.js";

const router = Router();

// A user requests to join using a project code.
router.post(
  "/join-requests",
  authenticate,
  createJoinRequestController
);

// Project owners/admins manage requests for their project.
router.get(
  "/:projectId/join-requests",
  authenticate,
  getProjectJoinRequestsController
);

router.post(
  "/:projectId/join-requests/:requestId/approve",
  authenticate,
  approveJoinRequestController
);

router.post(
  "/:projectId/join-requests/:requestId/reject",
  authenticate,
  rejectJoinRequestController
);

export default router;
