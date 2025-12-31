import { Request, Response } from "express";

export class AuthController {
  async registerUser(req: Request, res: Response) {
    return res.status(200).json({
      message: "Register route working",
    });
  }

  async loginUser(req: Request, res: Response) {
    return res.status(200).json({
      message: "Login route working",
    });
  }
}
