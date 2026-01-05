import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { authorizedMiddleware } from "../middlewares/authorized.middleware";

const router = Router();
const userController = new UserController();

// Protected routes - require authentication
router.get("/profile", authorizedMiddleware, userController.getProfile);
router.put("/profile", authorizedMiddleware, userController.updateProfile);

export default router;