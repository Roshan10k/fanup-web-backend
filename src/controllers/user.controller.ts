import { Request, Response } from "express";
import { UserService } from "../services/user.service";
import { UpdateUserDtoSchema } from "../dtos/user.dto";
import { HttpError } from "../errors/http-error";

const userService = new UserService();

export class UserController {
  // Get current user profile
  async getProfile(req: Request, res: Response) {
    try {
      // req.user is already attached by authorizedMiddleware
      if (!req.user) {
        throw new HttpError(401, "User not authenticated");
      }

      // req.user already has the full user object from DB
      const { password, ...userWithoutPassword } = req.user.toObject();

      return res.status(200).json({
        success: true,
        message: "Profile retrieved successfully",
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
        message: "Failed to retrieve profile",
      });
    }
  }

  // Update current user profile
  async updateProfile(req: Request, res: Response) {
    try {
      if (!req.user) {
        throw new HttpError(401, "User not authenticated");
      }

      const validatedData = UpdateUserDtoSchema.parse(req.body);
      const updatedUser = await userService.updateProfile(
        req.user._id.toString(),
        validatedData
      );

      const { password, ...userWithoutPassword } = updatedUser.toObject();

      return res.status(200).json({
        success: true,
        message: "Profile updated successfully",
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

  async getProfileStats(req: Request, res: Response) {
    try {
      if (!req.user) {
        throw new HttpError(401, "User not authenticated");
      }

      const stats = await userService.getProfileStats(req.user._id.toString());

      return res.status(200).json({
        success: true,
        message: "Profile stats retrieved successfully",
        data: stats,
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
        message: "Failed to retrieve profile stats",
      });
    }
  }
}
