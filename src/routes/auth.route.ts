import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { authorizedMiddleware } from "../middlewares/authorized.middleware";
import { createUpload } from "../middlewares/upload.middleware";

const router = Router();
const authController = new AuthController();

// Reuse centralized multer config
const uploadProfile = createUpload("profile-pictures");

// Register new user
router.post("/register", authController.registerUser);

// Login user
router.post("/login", authController.loginUser);

// Upload profile picture (existing endpoint)
router.post(
  "/upload-profile-photo",
  authorizedMiddleware,
  uploadProfile.single("photo"),
  authController.uploadProfilePicture
);

// Update user profile with optional image upload (NEW ENDPOINT)
router.put(
  "/:id",
  authorizedMiddleware,
  uploadProfile.single("photo"),
  authController.updateUser
);

export default router;