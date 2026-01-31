import { Request, Response } from "express";

import { UpdateUserDtoSchema, CreateUserDtoSchema } from "../../dtos/user.dto";
import { HttpError } from "../../errors/http-error";
import { AdminUserService } from "../../services/admin/adminuser.service";

const adminUserService = new AdminUserService();

export class AdminUserController {
  // Create new user (admin only)
  async createUser(req: Request, res: Response) {
    try {
      const validatedData = CreateUserDtoSchema.parse(req.body);
      
      // Add profile picture if uploaded
      const profilePicture = req.file ? req.file.filename : null;
      
      const newUser = await adminUserService.createUser({
        ...validatedData,
        profilePicture
      });
      
      const { password, ...userWithoutPassword } = newUser.toObject();

      return res.status(201).json({
        success: true,
        message: "User created successfully",
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
        message: error instanceof Error ? error.message : "User creation failed",
      });
    }
  }

  // Get all users
  async getAllUsers(req: Request, res: Response) {
    try {
      const users = await adminUserService.getAllUsers();
      
      // Remove passwords from all users
      const usersWithoutPasswords = users.map((user) => {
        const { password, ...userWithoutPassword } = user.toObject();
        return userWithoutPassword;
      });

      return res.status(200).json({
        success: true,
        message: "Users retrieved successfully",
        data: usersWithoutPasswords,
        count: usersWithoutPasswords.length,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to retrieve users",
      });
    }
  }

  // Get single user by ID
  async getUserById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const user = await adminUserService.getUserById(id);
      
      const { password, ...userWithoutPassword } = user.toObject();

      return res.status(200).json({
        success: true,
        message: "User retrieved successfully",
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
        message: "Failed to retrieve user",
      });
    }
  }

  // Update any user
  async updateUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const validatedData = UpdateUserDtoSchema.parse(req.body);
      
      // Add profile picture if uploaded
      if (req.file) {
        validatedData.profilePicture = req.file.filename;
      }
      
      const updatedUser = await adminUserService.updateUser(id, validatedData);
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

  // Delete user
  async deleteUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      await adminUserService.deleteUser(id);

      return res.status(200).json({
        success: true,
        message: "User deleted successfully",
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
        message: "Failed to delete user",
      });
    }
  }

  // Get user statistics
  async getUserStats(req: Request, res: Response) {
    try {
      const stats = await adminUserService.getUserStats();

      return res.status(200).json({
        success: true,
        message: "User statistics retrieved successfully",
        data: stats,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to retrieve statistics",
      });
    }
  }
}