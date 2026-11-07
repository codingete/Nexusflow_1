import express from "express";
import {
  getTeacherDashboardStats,
  getRequests,
  acceptRequest,
  rejectRequest,
  getAssignedStudents,
  getTeacherFiles,
} from "../controllers/teacherController.js";
import { isAuthenticated, isAuthorized } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(isAuthenticated, isAuthorized("Teacher"));

router.get("/fetch-dashboard-stats", getTeacherDashboardStats);
router.get("/requests", getRequests);
router.put("/requests/:requestId/accept", acceptRequest);
router.put("/requests/:requestId/reject", rejectRequest);
router.get("/assigned-students", getAssignedStudents);
router.get("/files", getTeacherFiles);

export default router;
