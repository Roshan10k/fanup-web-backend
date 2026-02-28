import { z } from "zod";

export const DevicePlatformSchema = z.enum(["android", "ios", "web"]);

export const DeviceTokenSchema = z.object({
  userId: z.string(),
  token: z.string().min(10),
  platform: DevicePlatformSchema,
  deviceId: z.string().trim().min(1).nullable().optional(),
  appVersion: z.string().trim().min(1).nullable().optional(),
  isActive: z.boolean().default(true),
  lastSeenAt: z.date().default(() => new Date()),
});

export type DevicePlatform = z.infer<typeof DevicePlatformSchema>;
export type DeviceTokenType = z.infer<typeof DeviceTokenSchema>;
