import { Router } from "express";
import { AdminUserController } from "../../controllers/admin/user.controller";
import { authorizedMiddleware, adminMiddleware } from "../../middlewares/authorized.middleware";

const router = Router();
const adminUserController = new AdminUserController();

// All routes require authentication AND admin role
router.get("/stats", authorizedMiddleware, adminMiddleware, adminUserController.getUserStats);
router.get("/", authorizedMiddleware, adminMiddleware, adminUserController.getAllUsers);
router.get("/:id", authorizedMiddleware, adminMiddleware, adminUserController.getUserById);
router.put("/:id", authorizedMiddleware, adminMiddleware, adminUserController.updateUser);
router.delete("/:id", authorizedMiddleware, adminMiddleware, adminUserController.deleteUser);

export default router;