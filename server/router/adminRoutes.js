import express from "express";
import { 
  createStudent, 
  createTeacher, 
  updateStudent, 
  updateTeacher, 
  deleteStudent, 
  deleteTeacher,
  getDashboardStats
} from "../controllers/adminController.js";
import { isAuthenticated, isAuthorized } from "../middlewares/authMiddleware.js";
import { getAllUsers } from "../services/userServices.js";

const router = express.Router();

// ----------------- STUDENT ROUTES -----------------
router.post(
  "/create-student",
  isAuthenticated,
  isAuthorized("Admin"),
  createStudent
);

router.put(
  "/update-student/:id",
  isAuthenticated,
  isAuthorized("Admin"),
  updateStudent
);

router.delete(
  "/delete-student/:id",
  isAuthenticated,
  isAuthorized("Admin"),
  deleteStudent
);

// ----------------- TEACHER ROUTES -----------------
router.post(
  "/create-teacher",
  isAuthenticated,
  isAuthorized("Admin"),
  createTeacher
);

router.put(
  "/update-teacher/:id",
  isAuthenticated,
  isAuthorized("Admin"),
  updateTeacher
);

router.delete(
  "/delete-teacher/:id",
  isAuthenticated,
  isAuthorized("Admin"),
  deleteTeacher
);

// ----------------- GET ALL USERS -----------------
router.get(
  "/users",
  isAuthenticated,
  isAuthorized("Admin"),
  getAllUsers
);

// ----------------- DASHBOARD STATS -----------------
router.get(
  "/fetch-dashboard-stats",
  isAuthenticated,
  isAuthorized("Admin"),
  getDashboardStats
);

export default router;