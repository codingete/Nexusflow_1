import express from "express";
import multer from "multer";
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
} from "../controllers/studentController.js";
import { isAuthenticated, isAuthorized } from "../middlewares/authMiddleware.js";

const router = express.Router();

// configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // folder where files will be saved
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

// initialize multer
const upload = multer({ storage });

// optional error handler for uploads
const handleUploadError = (err, req, res, next) => {
  if (err) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
  next();
};

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
