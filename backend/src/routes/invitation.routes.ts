import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { getMyInvitationsController, acceptInvitationController, rejectInvitationController } from "../controllers/invitation.controller.js";

const router = Router();

router.get(
  "/",
  authenticate,
  getMyInvitationsController
);

router.get("/", authenticate, getMyInvitationsController);

router.post(
  "/:invitationId/accept",
  authenticate,
  acceptInvitationController
);

router.post(
  "/:invitationId/reject",
  authenticate,
  rejectInvitationController
);

export default router;