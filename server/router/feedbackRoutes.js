import express from "express";
import { isAuthenticated } from "../middlewares/authMiddleware.js";
import { createFeedback, getProjectFeedback } from "../controllers/feedbackController.js";

const router = express.Router();

router.post("/projects/:projectId/feedback", isAuthenticated, createFeedback);
router.get("/projects/:projectId/feedback", isAuthenticated, getProjectFeedback);

export default router;