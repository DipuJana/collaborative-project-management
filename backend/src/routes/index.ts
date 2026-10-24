import { Router } from "express";
import authRouter from "./auth.routes.js";
import projectRouter from "./project.routes.js";
import invitationRouter from "./invitation.routes.js";
import projectJoinRequestRouter from "./projectJoinRequest.routes.js";
import taskRouter from "./task.routes.js";

const router = Router();

router.get("/health", (_req, res) => {
  res.json({
    status: "ok",
  });
});

router.use("/auth", authRouter);
router.use("/projects", projectRouter);
router.use("/invitations", invitationRouter);
router.use("/projects", projectJoinRequestRouter);
router.use("/projects", projectRouter);
router.use("/projects", taskRouter);

export default router;