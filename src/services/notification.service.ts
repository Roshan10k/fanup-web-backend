import { HttpError } from "../errors/http-error";
import { NotificationRepository } from "../repositories/notification.repository";
import { NotificationData } from "../types/notification.type";

const notificationRepository = new NotificationRepository();

export class NotificationService {
  /**
   * Get paginated notifications for a user
   */
  async getNotifications(userId: string, page = 1, size = 20) {
    const safePage = Number.isFinite(page) ? Math.max(1, Math.floor(page)) : 1;
    const safeSize = Number.isFinite(size)
      ? Math.max(1, Math.min(50, Math.floor(size)))
      : 20;

    const { rows, total } = await notificationRepository.findByUser(
      userId,
      safePage,
      safeSize
    );

    return {
      rows: rows.map((notification) => ({
        id: notification._id.toString(),
        type: notification.type,
        title: notification.title,
        message: notification.message,
        referenceId: notification.referenceId,
        referenceType: notification.referenceType,
        metadata: notification.metadata,
        isRead: notification.isRead,
        createdAt: notification.createdAt,
      })),
      pagination: {
        page: safePage,
        size: safeSize,
        total,
        totalPages: Math.ceil(total / safeSize) || 1,
      },
    };
  }

  /**
   * Get unread notification count for a user
   */
  async getUnreadCount(userId: string) {
    const count = await notificationRepository.getUnreadCount(userId);
    return { count };
  }

  /**
   * Mark a single notification as read
   */
  async markAsRead(notificationId: string, userId: string) {
    const notification = await notificationRepository.markAsRead(
      notificationId,
      userId
    );

    if (!notification) {
      throw new HttpError(404, "Notification not found");
    }

    return {
      id: notification._id.toString(),
      isRead: notification.isRead,
    };
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string) {
    const count = await notificationRepository.markAllAsRead(userId);
    return { markedCount: count };
  }

  /**
   * Delete a single notification
   */
  async deleteNotification(notificationId: string, userId: string) {
    const deleted = await notificationRepository.delete(notificationId, userId);

    if (!deleted) {
      throw new HttpError(404, "Notification not found");
    }

    return { deleted: true };
  }

  /**
   * Create a notification for contest joined
   */
  async createContestJoinedNotification(
    userId: string,
    matchId: string,
    teamAName: string,
    teamBName: string,
    teamName: string
  ) {
    return await notificationRepository.create({
      userId,
      type: "contest_joined",
      title: "Contest Joined Successfully!",
      message: `You've joined the ${teamAName} vs ${teamBName} contest with team "${teamName}". Good luck!`,
      referenceId: matchId,
      referenceType: "match",
      metadata: {
        matchId,
        teamName,
        teamAName,
        teamBName,
      },
    });
  }

  /**
   * Create a notification for match completed
   */
  async createMatchCompletedNotification(
    userId: string,
    matchId: string,
    teamAName: string,
    teamBName: string,
    userRank: number,
    userPoints: number
  ) {
    return await notificationRepository.create({
      userId,
      type: "match_completed",
      title: "Match Completed!",
      message: `${teamAName} vs ${teamBName} match is now complete. You finished at rank #${userRank} with ${userPoints} points.`,
      referenceId: matchId,
      referenceType: "match",
      metadata: {
        matchId,
        teamAName,
        teamBName,
        rank: userRank,
        points: userPoints,
      },
    });
  }

  /**
   * Create a notification for prize credited
   */
  async createPrizeCreditedNotification(
    userId: string,
    matchId: string,
    teamAName: string,
    teamBName: string,
    prizeAmount: number,
    rank: number
  ) {
    return await notificationRepository.create({
      userId,
      type: "prize_credited",
      title: "Prize Credited! 🎉",
      message: `Congratulations! ₹${prizeAmount} has been credited to your wallet for finishing #${rank} in ${teamAName} vs ${teamBName} contest.`,
      referenceId: matchId,
      referenceType: "wallet",
      metadata: {
        matchId,
        teamAName,
        teamBName,
        prizeAmount,
        rank,
      },
    });
  }

  /**
   * Create multiple notifications for batch operations
   */
  async createBatchNotifications(notifications: NotificationData[]) {
    if (!notifications.length) return [];
    return await notificationRepository.createMany(notifications);
  }

  /**
   * Create a system notification
   */
  async createSystemNotification(
    userId: string,
    title: string,
    message: string,
    metadata?: Record<string, unknown>
  ) {
    return await notificationRepository.create({
      userId,
      type: "system",
      title,
      message,
      metadata,
    });
  }
}
