import express from "express";
import {
  forgetPassword,
  getUser,
  login,
  logout,
  resetPassword,
  updatePassword,
} from "../controllers/authController.js";
import { isAuthenticated } from "../middlewares/authMiddleware.js";

const router = express.Router();

// No public /register route: accounts are created by an admin only.
router.post("/login", login);
router.get("/me", isAuthenticated, getUser);
router.get("/logout", isAuthenticated, logout);
router.put("/password/update", isAuthenticated, updatePassword);
router.post("/password/forget", forgetPassword);
router.put("/password/reset/:token", resetPassword);

export default router;
