import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import multer from "multer";
import { authorizedMiddleware } from "../middlewares/authorized.middleware";

const router = Router();
const authController = new AuthController();

// Configure multer for profile picture uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads/profile_pictures/");
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
    cb(null, uniqueName);
  },
});

const fileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedMimes = ["image/jpeg", "image/png", "image/jpg"];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only JPEG and PNG allowed."));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

router.post("/register", authController.registerUser);
router.post("/login", authController.loginUser);
router.post(
  "/upload-photo",
  authorizedMiddleware,
  upload.single("photo"),
  authController.uploadProfilePicture
);

export default router;