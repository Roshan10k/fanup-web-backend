import { NextFunction, Request, Response } from "express";

import { UpdateUserDtoSchema, CreateUserDtoSchema } from "../../dtos/user.dto";
import { HttpError } from "../../errors/http-error";
import { AdminUserService } from "../../services/admin/adminuser.service";
import { QueryParams } from "../../types/query.type";
import { createLink, createPaginationLinks, buildLinkHeader } from "../../helpers/hateoas";


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
      
      const { password: _pw1, ...userWithoutPassword } = newUser.toObject();

      const userId = userWithoutPassword._id.toString();
      return res
        .setHeader("Location", `/api/admin/users/${userId}`)
        .status(201)
        .json({
          success: true,
          message: "User created successfully",
          data: userWithoutPassword,
          _links: {
            self: createLink(`/api/admin/users/${userId}`, "GET"),
            update: createLink(`/api/admin/users/${userId}`, "PUT", "Update this user"),
            delete: createLink(`/api/admin/users/${userId}`, "DELETE", "Delete this user"),
            list: createLink("/api/admin/users", "GET", "View all users"),
          },
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
  async getAllUsers(req: Request, res: Response, _next: NextFunction) {
        try {
            const { page, size, search, sortBy, sortOrder }: QueryParams & { sortBy?: string; sortOrder?: string } = req.query;
            const { users, pagination } = await adminUserService.getAllUsers(
                page, size, search, sortBy, sortOrder
            );

            const paginationLinks = createPaginationLinks(
              "/api/admin/users",
              pagination.page,
              pagination.totalPages,
              pagination.size,
              { search, sortBy, sortOrder }
            );

            res.setHeader(
              "Link",
              buildLinkHeader("/api/admin/users", pagination.page, pagination.totalPages, pagination.size, { search, sortBy, sortOrder })
            );
            res.setHeader("X-Total-Count", String(pagination.totalItems));

            return res.status(200).json(
                { success: true, data: users, pagination: pagination, message: "All Users Retrieved",
                  _links: {
                    ...paginationLinks,
                    create: createLink("/api/admin/users", "POST", "Create a new user"),
                    stats: createLink("/api/admin/users/stats", "GET", "View user statistics"),
                  },
                }
            );
        } catch (error: unknown) {
            const httpErr = error as { statusCode?: number; message?: string };
            return res.status(httpErr.statusCode ?? 500).json(
                { success: false, message: httpErr.message || "Internal Server Error" }
            );
        }
    }

  // Get single user by ID
  async getUserById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const user = await adminUserService.getUserById(id);
      
      const { password: _pw2, ...userWithoutPassword } = user.toObject();

      return res.status(200).json({
        success: true,
        message: "User retrieved successfully",
        data: userWithoutPassword,
        _links: {
          self: createLink(`/api/admin/users/${id}`, "GET"),
          update: createLink(`/api/admin/users/${id}`, "PUT", "Update this user"),
          delete: createLink(`/api/admin/users/${id}`, "DELETE", "Delete this user"),
          list: createLink("/api/admin/users", "GET", "View all users"),
        },
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
      const { password: _pw3, ...userWithoutPassword } = updatedUser.toObject();

      return res.status(200).json({
        success: true,
        message: "User updated successfully",
        data: userWithoutPassword,
        _links: {
          self: createLink(`/api/admin/users/${id}`, "PUT"),
          view: createLink(`/api/admin/users/${id}`, "GET", "View this user"),
          delete: createLink(`/api/admin/users/${id}`, "DELETE", "Delete this user"),
          list: createLink("/api/admin/users", "GET", "View all users"),
        },
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
        _links: {
          list: createLink("/api/admin/users", "GET", "View all users"),
          create: createLink("/api/admin/users", "POST", "Create a new user"),
        },
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
        _links: {
          self: createLink("/api/admin/users/stats", "GET"),
          list: createLink("/api/admin/users", "GET", "View all users"),
        },
      });
    } catch {
      return res.status(500).json({
        success: false,
        message: "Failed to retrieve statistics",
      });
    }
  }
}