export type NotificationType =
  | "contest_joined"
  | "match_completed"
  | "prize_credited"
  | "system";

export interface NotificationData {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  referenceId?: string | null;
  referenceType?: "match" | "contest" | "wallet" | null;
  metadata?: Record<string, unknown>;
  isRead?: boolean;
}
