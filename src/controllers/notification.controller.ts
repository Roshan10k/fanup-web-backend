import { Request, Response } from "express";
import { HttpError } from "../errors/http-error";
import { NotificationService } from "../services/notification.service";

const notificationService = new NotificationService();

export class NotificationController {
  async getNotifications(req: Request, res: Response) {
    try {
      const userId = req.user?._id.toString();
      if (!userId) {
        throw new HttpError(401, "User not authenticated");
      }

      const page = parseInt(String(req.query.page || "1"), 10);
      const size = parseInt(String(req.query.size || "20"), 10);

      const result = await notificationService.getNotifications(userId, page, size);

      return res.status(200).json({
        success: true,
        message: "Notifications retrieved successfully",
        data: result,
      });
    } catch (error: unknown) {
      if (error instanceof HttpError) {
        return res.status(error.statusCode).json({
          success: false,
          message: error.message,
        });
      }

      return res.status(500).json({
        success: false,
        message: "Failed to retrieve notifications",
      });
    }
  }

  async getUnreadCount(req: Request, res: Response) {
    try {
      const userId = req.user?._id.toString();
      if (!userId) {
        throw new HttpError(401, "User not authenticated");
      }

      const result = await notificationService.getUnreadCount(userId);

      return res.status(200).json({
        success: true,
        message: "Unread count retrieved successfully",
        data: result,
      });
    } catch (error: unknown) {
      if (error instanceof HttpError) {
        return res.status(error.statusCode).json({
          success: false,
          message: error.message,
        });
      }

      return res.status(500).json({
        success: false,
        message: "Failed to retrieve unread count",
      });
    }
  }

  async markAsRead(req: Request, res: Response) {
    try {
      const userId = req.user?._id.toString();
      if (!userId) {
        throw new HttpError(401, "User not authenticated");
      }

      const { id } = req.params;
      const result = await notificationService.markAsRead(id, userId);

      return res.status(200).json({
        success: true,
        message: "Notification marked as read",
        data: result,
      });
    } catch (error: unknown) {
      if (error instanceof HttpError) {
        return res.status(error.statusCode).json({
          success: false,
          message: error.message,
        });
      }

      return res.status(500).json({
        success: false,
        message: "Failed to mark notification as read",
      });
    }
  }

  async markAllAsRead(req: Request, res: Response) {
    try {
      const userId = req.user?._id.toString();
      if (!userId) {
        throw new HttpError(401, "User not authenticated");
      }

      const result = await notificationService.markAllAsRead(userId);

      return res.status(200).json({
        success: true,
        message: "All notifications marked as read",
        data: result,
      });
    } catch (error: unknown) {
      if (error instanceof HttpError) {
        return res.status(error.statusCode).json({
          success: false,
          message: error.message,
        });
      }

      return res.status(500).json({
        success: false,
        message: "Failed to mark all notifications as read",
      });
    }
  }

  async deleteNotification(req: Request, res: Response) {
    try {
      const userId = req.user?._id.toString();
      if (!userId) {
        throw new HttpError(401, "User not authenticated");
      }

      const { id } = req.params;
      const result = await notificationService.deleteNotification(id, userId);

      return res.status(200).json({
        success: true,
        message: "Notification deleted",
        data: result,
      });
    } catch (error: unknown) {
      if (error instanceof HttpError) {
        return res.status(error.statusCode).json({
          success: false,
          message: error.message,
        });
      }

      return res.status(500).json({
        success: false,
        message: "Failed to delete notification",
      });
    }
  }
}
