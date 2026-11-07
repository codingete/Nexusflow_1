import express from "express";
import {
  getAvailableSupervisors,
  getStudentProject,
  getProjectById,
  getSupervisor,
  requestSupervisor,
  submitProposal,
  uploadFiles,
  getMyRequests,
  getDashboardStats,
  downloadFile,
  ensureOwnProject,
} from "../controllers/studentController.js";
import { isAuthenticated, isAuthorized } from "../middlewares/authMiddleware.js";
import { upload, handleUploadError } from "../middlewares/upload.js";

const router = express.Router();

router.get(
  "/project",
  isAuthenticated,
  isAuthorized("Student"),
  getStudentProject
);

router.get(
  "/project/:projectId",
  isAuthenticated,
  isAuthorized("Student"),
  getProjectById
);

router.post(
  "/proposal",
  isAuthenticated,
  isAuthorized("Student"),
  submitProposal
);

router.post(
  "/upload/:projectId",
  isAuthenticated,
  isAuthorized("Student"),
  ensureOwnProject,
  upload.array("files", 10),
  handleUploadError,
  uploadFiles
);

router.get(
  "/fetch-supervisors",
  isAuthenticated,
  isAuthorized("Student"),
  getAvailableSupervisors
);

router.get(
  "/supervisor",
  isAuthenticated,
  isAuthorized("Student"),
  getSupervisor
);

router.post(
  "/request-supervisor",
  isAuthenticated,
  isAuthorized("Student"),
  requestSupervisor
);

router.get(
  "/my-requests",
  isAuthenticated,
  isAuthorized("Student"),
  getMyRequests
);

router.get(
  "/fetch-dashboard-stats",
  isAuthenticated,
  isAuthorized("Student"),
  getDashboardStats
);

router.get(
  "/:projectId/files/:fileId/download",
  isAuthenticated,
  isAuthorized("Admin", "Teacher", "Student"),
  downloadFile
);

export default router;
