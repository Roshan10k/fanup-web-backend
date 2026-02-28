import { DeviceTokenRepository } from "../repositories/device-token.repository";
import { DevicePlatform } from "../types/device-token.type";
import { FcmPushProvider } from "./providers/fcm-push.provider";

const invalidTokenErrors = new Set([
  "InvalidRegistration",
  "NotRegistered",
  "MismatchSenderId",
  "invalid-registration-token",
  "registration-token-not-registered",
]);

interface SendPushInput {
  userIds: string[];
  title: string;
  body: string;
  data?: Record<string, string>;
}

interface RegisterPushTokenInput {
  userId: string;
  token: string;
  platform: DevicePlatform;
  deviceId?: string | null;
  appVersion?: string | null;
}

const deviceTokenRepository = new DeviceTokenRepository();
const pushProvider = new FcmPushProvider();

export class PushService {
  async registerDeviceToken(input: RegisterPushTokenInput) {
    const doc = await deviceTokenRepository.registerOrUpdate(input);
    return {
      id: doc._id.toString(),
      token: doc.token,
      platform: doc.platform,
      isActive: doc.isActive,
      lastSeenAt: doc.lastSeenAt,
    };
  }

  async unregisterDeviceToken(userId: string, token: string) {
    const deactivated = await deviceTokenRepository.deactivateByToken(userId, token);
    return { deactivated };
  }

  async sendToUsers(input: SendPushInput) {
    const tokens = await deviceTokenRepository.findActiveByUserIds(input.userIds);
    if (!tokens.length) {
      return {
        totalTokens: 0,
        successCount: 0,
        failureCount: 0,
      };
    }

    const results = await pushProvider.sendMany(
      tokens.map((row) => ({
        token: row.token,
        title: input.title,
        body: input.body,
        data: input.data,
      }))
    );

    const invalidTokens = results
      .filter((row) => !row.success && row.errorCode && invalidTokenErrors.has(row.errorCode))
      .map((row) => row.token);

    if (invalidTokens.length) {
      await deviceTokenRepository.deactivateByTokens(invalidTokens);
    }

    const successCount = results.filter((row) => row.success).length;
    const failureCount = results.length - successCount;

    return {
      totalTokens: results.length,
      successCount,
      failureCount,
    };
  }
}
