import { Request, Response } from "express";
import { UserService } from "../services/user.service";
import {
  CreateUserDtoSchema,
  GoogleLoginDtoSchema,
  LoginUserDtoSchema,
  UpdateUserDtoSchema,
} from "../dtos/user.dto";
import { HttpError } from "../errors/http-error";
import { createLink } from "../helpers/hateoas";

const userService = new UserService();

export class AuthController {
  async registerUser(req: Request, res: Response) {
    try {
      const validatedData = CreateUserDtoSchema.parse(req.body);
      const newUser = await userService.registerUser(validatedData);
      const { password: _pw1, ...userWithoutPassword } = newUser.toObject();

      return res
        .setHeader("Location", `/api/users/profile`)
        .status(201)
        .json({
          success: true,
          message: "User registered successfully",
          data: userWithoutPassword,
          _links: {
            self: createLink("/api/auth/register", "POST"),
            login: createLink("/api/auth/login", "POST", "Login with credentials"),
            googleLogin: createLink("/api/auth/google", "POST", "Login with Google"),
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
        message: error instanceof Error ? error.message : "Registration failed",
      });
    }
  }

  async loginUser(req: Request, res: Response) {
    try {
      const validatedData = LoginUserDtoSchema.parse(req.body);
      const { user, token } = await userService.loginUser(validatedData);
      const { password: _pw2, ...userWithoutPassword } = user.toObject();

      return res.status(200).json({
        success: true,
        message: "Login successful",
        token: token,
        data: userWithoutPassword,
        _links: {
          self: createLink("/api/auth/login", "POST"),
          profile: createLink("/api/users/profile", "GET", "View your profile"),
          matches: createLink("/api/matches", "GET", "Browse matches"),
          wallet: createLink("/api/wallet/summary", "GET", "View wallet"),
          notifications: createLink("/api/notifications", "GET", "View notifications"),
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
        message: error instanceof Error ? error.message : "Login failed",
      });
    }
  }

  async loginWithGoogle(req: Request, res: Response) {
    try {
      const validatedData = GoogleLoginDtoSchema.parse(req.body);
      const { user, token } = await userService.loginWithGoogle(
        validatedData.credential
      );
      const { password: _pw3, ...userWithoutPassword } = user.toObject();

      return res.status(200).json({
        success: true,
        message: "Google login successful",
        token,
        data: userWithoutPassword,
        _links: {
          self: createLink("/api/auth/google", "POST"),
          profile: createLink("/api/users/profile", "GET", "View your profile"),
          matches: createLink("/api/matches", "GET", "Browse matches"),
          wallet: createLink("/api/wallet/summary", "GET", "View wallet"),
          notifications: createLink("/api/notifications", "GET", "View notifications"),
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
        message: error instanceof Error ? error.message : "Google login failed",
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
      const { password: _pw4, ...userWithoutPassword } = updatedUser.toObject();

      return res.status(200).json({
        success: true,
        message: "Profile picture uploaded successfully",
        data: userWithoutPassword,
        _links: {
          self: createLink("/api/auth/upload-profile-photo", "POST"),
          profile: createLink("/api/users/profile", "GET", "View your profile"),
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
      const { password: _pw5, ...userWithoutPassword } = updatedUser.toObject();

      return res.status(200).json({
        success: true,
        message: "User updated successfully",
        data: userWithoutPassword,
        _links: {
          self: createLink(`/api/auth/${id}`, "PUT"),
          profile: createLink("/api/users/profile", "GET", "View your profile"),
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

  async sendResetPasswordEmail(req: Request, res: Response) {
    try {
      const email = req.body.email;
      await userService.sendResetPasswordEmail(email);
      return res.status(200).json({
        success: true,
        message: "If the email is registered, a reset link has been sent.",
        _links: {
          self: createLink("/api/auth/request-password-reset", "POST"),
          login: createLink("/api/auth/login", "POST", "Login with credentials"),
        },
      });
    } catch (error: unknown) {
      const httpErr = error as { statusCode?: number; message?: string };
      return res.status(httpErr.statusCode ?? 500).json({
        success: false,
        message: httpErr.message || "Internal Server Error",
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
          _links: {
            self: createLink(`/api/auth/reset-password/${token}`, "POST"),
            login: createLink("/api/auth/login", "POST", "Login with new password"),
          },
        });
    } catch (error: unknown) {
      const httpErr = error as { statusCode?: number; message?: string };
      return res
        .status(httpErr.statusCode ?? 500)
        .json({
          success: false,
          message: httpErr.message || "Internal Server Error",
        });
    }
  }
}
