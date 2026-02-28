import { Types } from "mongoose";
import { DeviceTokenModel, IDeviceToken } from "../models/device-token.model";
import { DevicePlatform } from "../types/device-token.type";

interface RegisterDeviceTokenInput {
  userId: string;
  token: string;
  platform: DevicePlatform;
  deviceId?: string | null;
  appVersion?: string | null;
}

export class DeviceTokenRepository {
  async registerOrUpdate(input: RegisterDeviceTokenInput): Promise<IDeviceToken> {
    const now = new Date();
    const tokenDoc = await DeviceTokenModel.findOneAndUpdate(
      { token: input.token },
      {
        $set: {
          userId: new Types.ObjectId(input.userId),
          platform: input.platform,
          deviceId: input.deviceId ?? null,
          appVersion: input.appVersion ?? null,
          isActive: true,
          lastSeenAt: now,
        },
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      }
    );

    if (!tokenDoc) {
      throw new Error("Failed to register device token");
    }

    return tokenDoc;
  }

  async deactivateByToken(userId: string, token: string): Promise<boolean> {
    const result = await DeviceTokenModel.updateOne(
      { userId: new Types.ObjectId(userId), token },
      {
        $set: {
          isActive: false,
          lastSeenAt: new Date(),
        },
      }
    );

    return result.modifiedCount > 0;
  }

  async deactivateByTokens(tokens: string[]): Promise<number> {
    if (!tokens.length) return 0;
    const result = await DeviceTokenModel.updateMany(
      { token: { $in: tokens } },
      {
        $set: {
          isActive: false,
          lastSeenAt: new Date(),
        },
      }
    );
    return result.modifiedCount;
  }

  async findActiveByUserIds(userIds: string[]): Promise<IDeviceToken[]> {
    const objectIds = userIds
      .filter((id) => Types.ObjectId.isValid(id))
      .map((id) => new Types.ObjectId(id));

    if (!objectIds.length) return [];

    return await DeviceTokenModel.find({
      userId: { $in: objectIds },
      isActive: true,
    });
  }
}
