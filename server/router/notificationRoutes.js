import express from "express";
import { isAuthenticated } from "../middlewares/auth.js";
import { isAuthorized } from "../middlewares/auth.js";
import {
    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    getUnreadCount,
} from "../controllers/notificationController.js";

const router = express.Router();

router.get("/notifications", isAuthenticated, getNotifications);
router.patch("/notifications/:id/read", isAuthenticated, markAsRead);
router.patch("/notifications/read-all", isAuthenticated, markAllAsRead);
router.delete("/notifications/:id", isAuthenticated, deleteNotification);
router.get("/notifications/unread-count", isAuthenticated, getUnreadCount);

export default router;