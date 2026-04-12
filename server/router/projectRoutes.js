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
import { upload } from "../utils/multer.js";

const router = express.Router();

router.post("/", isAuthenticated, isAuthorized("Student"), createProject);

router.get("/:projectId", isAuthenticated, getProject);

router.get(
  "/",
  isAuthenticated,
  isAuthorized("Admin", "Teacher"),
  getAllProjects
);

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

router.get(
  "/dashboard-stats",
  isAuthenticated,
  isAuthorized("Student"),
  fetchDashboardStats
);

export default router;