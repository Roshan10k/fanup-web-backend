import { z } from "zod";
import { DevicePlatformSchema } from "../types/device-token.type";

export const RegisterDeviceTokenDtoSchema = z.object({
  token: z.string().trim().min(10),
  platform: DevicePlatformSchema,
  deviceId: z.string().trim().min(1).nullable().optional(),
  appVersion: z.string().trim().min(1).nullable().optional(),
});

export type RegisterDeviceTokenDto = z.infer<typeof RegisterDeviceTokenDtoSchema>;
