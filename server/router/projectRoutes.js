import express from "express";
import {
  createProject,
  getProject,
  getAllProjects,
  assignSupervisor,
  updateProjectStatus,
  addFeedback,
  fetchDashboardStats,
} from "../controllers/projectController.js";
import { isAuthenticated, isAuthorized } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", isAuthenticated, isAuthorized("Student"), createProject);

router.get(
  "/",
  isAuthenticated,
  isAuthorized("Admin", "Teacher"),
  getAllProjects
);

// Must come before "/:projectId", which would otherwise match it.
router.get(
  "/dashboard-stats",
  isAuthenticated,
  isAuthorized("Student"),
  fetchDashboardStats
);

router.get("/:projectId", isAuthenticated, getProject);

router.put(
  "/:projectId/assign",
  isAuthenticated,
  isAuthorized("Admin"),
  assignSupervisor
);

router.put(
  "/:projectId/status",
  isAuthenticated,
  isAuthorized("Admin", "Teacher"),
  updateProjectStatus
);

router.post(
  "/:projectId/feedback",
  isAuthenticated,
  isAuthorized("Admin", "Teacher"),
  addFeedback
);

export default router;
