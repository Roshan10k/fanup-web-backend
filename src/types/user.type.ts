import { z } from "zod";

export const UserSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["user", "admin"]).default("user"),
  profilePicture: z.string().nullable().optional(),
  phone: z.string().trim().min(7).max(20).nullable().optional(),
  balance: z.number().min(0).default(0),
});

export type UserType = z.infer<typeof UserSchema>;

export type UserDocument = UserType & {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
};
