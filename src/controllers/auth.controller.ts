import { Request, Response } from "express";
import { UserService } from "../services/user.service";
import {
  CreateUserDtoSchema,
  LoginUserDtoSchema,
  UpdateUserDtoSchema,
} from "../dtos/user.dto";
import { HttpError } from "../errors/http-error";

const userService = new UserService();

export class AuthController {
  async registerUser(req: Request, res: Response) {
    try {
      const validatedData = CreateUserDtoSchema.parse(req.body);
      const newUser = await userService.registerUser(validatedData);
      const { password, ...userWithoutPassword } = newUser.toObject();

      return res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: userWithoutPassword,
      });
    } catch (error) {
      if (error instanceof HttpError) {
        return res.status(error.statusCode).json({
          success: false,
          message: error.message,
        });
      }

      return res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : "Registration failed",
      });
    }
  }

  async loginUser(req: Request, res: Response) {
    try {
      const validatedData = LoginUserDtoSchema.parse(req.body);
      const { user, token } = await userService.loginUser(validatedData);
      const { password, ...userWithoutPassword } = user.toObject();

      return res.status(200).json({
        success: true,
        message: "Login successful",
        token: token,
        data: userWithoutPassword,
      });
    } catch (error) {
      if (error instanceof HttpError) {
        return res.status(error.statusCode).json({
          success: false,
          message: error.message,
        });
      }

      return res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : "Login failed",
      });
    }
  }

  async uploadProfilePicture(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No file uploaded",
        });
      }

      const userId = req.user?._id.toString();
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const updatedUser = await userService.updateProfilePicture(
        userId,
        req.file.filename,
      );
      const { password, ...userWithoutPassword } = updatedUser.toObject();

      return res.status(200).json({
        success: true,
        message: "Profile picture uploaded successfully",
        data: userWithoutPassword,
      });
    } catch (error) {
      if (error instanceof HttpError) {
        return res.status(error.statusCode).json({
          success: false,
          message: error.message,
        });
      }

      return res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Upload failed",
      });
    }
  }

  async updateUser(req: Request, res: Response) {
    try {
      const { id } = req.params;

      // Verify the user is updating their own profile or is admin
      if (req.user?._id.toString() !== id && req.user?.role !== "admin") {
        return res.status(403).json({
          success: false,
          message: "Forbidden: Cannot update another user's profile",
        });
      }

      const validatedData = UpdateUserDtoSchema.parse(req.body);

      // Add profile picture if uploaded
      if (req.file) {
        validatedData.profilePicture = req.file.filename;
      }

      const updatedUser = await userService.updateProfile(id, validatedData);
      const { password, ...userWithoutPassword } = updatedUser.toObject();

      return res.status(200).json({
        success: true,
        message: "User updated successfully",
        data: userWithoutPassword,
      });
    } catch (error) {
      if (error instanceof HttpError) {
        return res.status(error.statusCode).json({
          success: false,
          message: error.message,
        });
      }

      return res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : "Update failed",
      });
    }
  }

  async sendResetPasswordEmail(req: Request, res: Response) {
    try {
      const email = req.body.email;
      await userService.sendResetPasswordEmail(email);
      return res.status(200).json({
        success: true,
        message: "If the email is registered, a reset link has been sent.",
      });
    } catch (error: Error | any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async resetPassword(req: Request, res: Response) {
    try {
      const token = req.params.token;
      const { newPassword } = req.body;
      await userService.resetPassword(token, newPassword);
      return res
        .status(200)
        .json({
          success: true,
          message: "Password has been reset successfully.",
        });
    } catch (error: Error | any) {
      return res
        .status(error.statusCode ?? 500)
        .json({
          success: false,
          message: error.message || "Internal Server Error",
        });
    }
  }
}
