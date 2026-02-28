import axios from "axios";
import { FCM_SERVER_KEY } from "../../configs";

interface PushMessage {
  token: string;
  title: string;
  body: string;
  data?: Record<string, string>;
}

interface PushSendResult {
  token: string;
  success: boolean;
  messageId?: string;
  errorCode?: string;
}

const FCM_LEGACY_ENDPOINT = "https://fcm.googleapis.com/fcm/send";

export class FcmPushProvider {
  async sendOne(message: PushMessage): Promise<PushSendResult> {
    if (!FCM_SERVER_KEY) {
      return {
        token: message.token,
        success: false,
        errorCode: "missing-fcm-server-key",
      };
    }

    try {
      const response = await axios.post(
        FCM_LEGACY_ENDPOINT,
        {
          to: message.token,
          notification: {
            title: message.title,
            body: message.body,
          },
          data: message.data || {},
        },
        {
          headers: {
            Authorization: `key=${FCM_SERVER_KEY}`,
            "Content-Type": "application/json",
          },
          timeout: 10_000,
        }
      );

      const firstResult = response.data?.results?.[0];
      if (firstResult?.error) {
        return {
          token: message.token,
          success: false,
          errorCode: String(firstResult.error),
        };
      }

      return {
        token: message.token,
        success: true,
        messageId: firstResult?.message_id
          ? String(firstResult.message_id)
          : undefined,
      };
    } catch (error: unknown) {
      const statusCode = axios.isAxiosError(error)
        ? error.response?.status
        : undefined;
      return {
        token: message.token,
        success: false,
        errorCode: statusCode ? `http-${statusCode}` : "fcm-request-failed",
      };
    }
  }

  async sendMany(messages: PushMessage[]): Promise<PushSendResult[]> {
    if (!messages.length) return [];
    return await Promise.all(messages.map((message) => this.sendOne(message)));
  }
}
