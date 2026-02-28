import { Router } from "express";
import { authorizedMiddleware } from "../middlewares/authorized.middleware";
import { NotificationController } from "../controllers/notification.controller";

const router = Router();
const notificationController = new NotificationController();

// Register or refresh push device token for authenticated user
router.post("/devices/register", authorizedMiddleware, notificationController.registerDeviceToken);

// Unregister device token for authenticated user
router.delete("/devices/:token", authorizedMiddleware, notificationController.unregisterDeviceToken);

// Get all notifications for the authenticated user
router.get("/", authorizedMiddleware, notificationController.getNotifications);

// Get unread notification count
router.get("/unread-count", authorizedMiddleware, notificationController.getUnreadCount);

// Mark a specific notification as read
router.patch("/:id/read", authorizedMiddleware, notificationController.markAsRead);

// Mark all notifications as read
router.patch("/read-all", authorizedMiddleware, notificationController.markAllAsRead);

// Delete a specific notification
router.delete("/:id", authorizedMiddleware, notificationController.deleteNotification);

export default router;
