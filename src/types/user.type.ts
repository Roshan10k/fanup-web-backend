import { z } from "zod";

export const UserSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["user", "admin"]).default("user"),
  profilePicture: z.string().nullable().optional(),
});

export type UserType = z.infer<typeof UserSchema>;

export type UserDocument = UserType & {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
};