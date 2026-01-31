import { z } from "zod";
import { UserSchema } from "../types/user.type";

//Create User DTO
export const CreateUserDtoSchema = UserSchema.pick({
  fullName: true,
  email: true,
  password: true,
})
  .extend({
    confirmPassword: z.string().min(6),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type CreateUserDto = z.infer<typeof CreateUserDtoSchema>;

//Update User DTO
// Update User DTO
export const UpdateUserDtoSchema = UserSchema.pick({
  fullName: true,
  email: true,
  password: true,
  profilePicture: true,
}).partial();

export type UpdateUserDto = z.infer<typeof UpdateUserDtoSchema>;



//Login DTO
export const LoginUserDtoSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export type LoginUserDto = z.infer<typeof LoginUserDtoSchema>;
