import { Types } from "mongoose";
import {
  INotification,
  NotificationModel,
} from "../models/notification.model";
import { NotificationData } from "../types/notification.type";

export class NotificationRepository {
  async create(data: NotificationData): Promise<INotification> {
    const notification = new NotificationModel({
      ...data,
      userId: new Types.ObjectId(data.userId),
    });
    await notification.save();
    return notification;
  }

  async createMany(notifications: NotificationData[]): Promise<INotification[]> {
    const docs = notifications.map((data) => ({
      ...data,
      userId: new Types.ObjectId(data.userId),
      isRead: data.isRead ?? false,
    }));
    return await NotificationModel.insertMany(docs);
  }

  async findByUser(
    userId: string,
    page: number,
    size: number
  ): Promise<{ rows: INotification[]; total: number }> {
    const filter = { userId: new Types.ObjectId(userId) };

    const [rows, total] = await Promise.all([
      NotificationModel.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * size)
        .limit(size),
      NotificationModel.countDocuments(filter),
    ]);

    return { rows, total };
  }

  async findById(id: string): Promise<INotification | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }
    return await NotificationModel.findById(id);
  }

  async markAsRead(id: string, userId: string): Promise<INotification | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }
    return await NotificationModel.findOneAndUpdate(
      { _id: new Types.ObjectId(id), userId: new Types.ObjectId(userId) },
      { $set: { isRead: true } },
      { new: true }
    );
  }

  async markAllAsRead(userId: string): Promise<number> {
    const result = await NotificationModel.updateMany(
      { userId: new Types.ObjectId(userId), isRead: false },
      { $set: { isRead: true } }
    );
    return result.modifiedCount;
  }

  async getUnreadCount(userId: string): Promise<number> {
    return await NotificationModel.countDocuments({
      userId: new Types.ObjectId(userId),
      isRead: false,
    });
  }

  async delete(id: string, userId: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) {
      return false;
    }
    const result = await NotificationModel.deleteOne({
      _id: new Types.ObjectId(id),
      userId: new Types.ObjectId(userId),
    });
    return result.deletedCount > 0;
  }

  async deleteAllByUser(userId: string): Promise<number> {
    const result = await NotificationModel.deleteMany({
      userId: new Types.ObjectId(userId),
    });
    return result.deletedCount;
  }
}
