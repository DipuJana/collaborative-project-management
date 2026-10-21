import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import {
  getMyInvitationsController,
} from "../controllers/invitation.controller.js";

const router = Router();

router.get(
  "/",
  authenticate,
  getMyInvitationsController
);

export default router;