import { Router } from "express";
import { AdminUserController } from "../../controllers/admin/user.controller";
import { authorizedMiddleware, adminMiddleware } from "../../middlewares/authorized.middleware";
import { createUpload } from "../../middlewares/upload.middleware";

const router = Router();
const adminUserController = new AdminUserController();

// Multer config for profile pictures
const uploadProfile = createUpload("profile-pictures");

// All routes require authentication AND admin role

// Get user statistics
router.get("/stats", authorizedMiddleware, adminMiddleware, adminUserController.getUserStats);

// Get all users
router.get("/", authorizedMiddleware, adminMiddleware, adminUserController.getAllUsers);

// Get user by ID
router.get("/:id", authorizedMiddleware, adminMiddleware, adminUserController.getUserById);

// Create new user with optional image upload
router.post("/", 
  authorizedMiddleware, 
  adminMiddleware, 
  uploadProfile.single("photo"),
  adminUserController.createUser
);

// Update user with optional image upload
router.put("/:id", 
  authorizedMiddleware, 
  adminMiddleware, 
  uploadProfile.single("photo"),
  adminUserController.updateUser
);

// Delete user
router.delete("/:id", authorizedMiddleware, adminMiddleware, adminUserController.deleteUser);

export default router;