import { Request, Response } from "express";
import { UserService } from "../services/user.service";
import { CreateUserDtoSchema, LoginUserDtoSchema } from "../dtos/user.dto";
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
      const user = await userService.loginUser(validatedData);
      const { password, ...userWithoutPassword } = user.toObject();
      
      return res.status(200).json({
        success: true,
        message: "Login successful",
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
}